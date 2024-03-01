<script lang="ts">
	/* eslint-disable @typescript-eslint/ban-ts-comment */
	/* eslint-disable svelte/no-at-html-tags */
	import type { PageData } from './$types';
	import AppTitle from '$lib/components/AppTitle.svelte';
	import { Tabs, TabItem, Img } from 'flowbite-svelte';
	import Attribution from './Attribution.svelte';
	import { onMount } from 'svelte';
	import * as THREE from 'three';
	import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
	import { providerFile, providerFolder, providers } from '$lib/data/map-providers';
	import type { MapProvider, TilesData } from '$lib/data/map-info';

	export let data: PageData;

	const scale3d = 0.2;
	const scale3dVertical = 0.4;

	const attrMapbox = data.map.features.some((x) => x.type === 'Tiles' && (x.data as TilesData)!.provider!.includes('mapbox'));
	const attrOSM = data.map.features.some((x) => x.type === 'Tiles' && (x.data as TilesData)!.provider!.includes('osm')) && !attrMapbox;

	let renderer : THREE.WebGLRenderer;
	let camera : THREE.PerspectiveCamera;
	let scene : THREE.Scene;

	function render() {
		if (renderer && scene && camera) {
			renderer.render(scene, camera);
		}
	}

	function attach3d() : void {
		if (renderer) {
			const container = document.getElementById('container-3d');
			container?.appendChild(renderer.domElement);
		}

		onWindowResize();
	}

	function onWindowResize() {
		const container = document.getElementById('container-3d');
		if (camera && renderer && container) {
			const containerSize = container.offsetWidth;
			camera.aspect = containerSize / containerSize;
			camera.updateProjectionMatrix();

			renderer.setSize(containerSize, containerSize);
		}

		render();
	}

	async function init3d() : Promise<void> {
		function getMaterial(textures : Map<string, THREE.Texture>, imageScale : number, imageProvider : string) : THREE.Material {
			if (imageProvider === 'mapboxDEM') {
				const vertexShader = `
				uniform sampler2D tDisplacement;
				uniform float tScale;
				out vec2 tuv;
				void main()	{
					tuv = uv;
					vec4 color = texture2D(tDisplacement, uv) * 256.0;
					// height in meters
					float height = -10000.0 + ((color.r * 256.0 * 256.0 + color.g * 256.0 + color.b) * 0.1);
					gl_Position = projectionMatrix
						* modelViewMatrix
						* vec4(position.x, position.y, position.z + height * tScale, 1.0);
				}
				`;
				const fragmentShader = `
				uniform sampler2D tDiffuse;
				in vec2 tuv;
				void main() {
					gl_FragColor = vec4(texture2D(tDiffuse, tuv));
				}
				`;
				return new THREE.ShaderMaterial({
					vertexShader: vertexShader,
					fragmentShader: fragmentShader,
					uniforms: {
						tScale: { value: imageScale },
						tDisplacement: { value: textures.get('displacement') },
						tDiffuse: { value: textures.get('diffuse') }
					}
				});
			} else {
				return new THREE.MeshBasicMaterial({
					map: textures.get('diffuse'),
				});
			}
		}

		const container = document.getElementById('container-3d')!;
		const containerSize = container.offsetWidth;

		camera = new THREE.PerspectiveCamera(45, 1.0 /* w/h */, 1, 1000);
		const cameraPos = data.map.height * 0.25;
		camera.position.set(-cameraPos, cameraPos, cameraPos);

		renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
		renderer.setPixelRatio(window.devicePixelRatio);
		renderer.setSize(containerSize, containerSize);

		const controls = new OrbitControls(camera, renderer.domElement);
		controls.addEventListener('change', render);
		controls.screenSpacePanning = true;
		window.addEventListener('resize', onWindowResize);

		scene = new THREE.Scene();

		// const helper = new THREE.GridHelper(160, 10, 0x8d8d8d, 0xc1c1c1);
		// scene.add(helper);

		if (data.data3d.length > 0) {
			const group = new THREE.Group();
			group.add(...data.data3d);

			const textureLoader = new THREE.TextureLoader();
			group.traverse((o : THREE.Object3D) => {
				const mesh = o as THREE.Mesh;
				const images = new Map<string, THREE.Texture>();
				// @ts-ignore
				const imageMaps = o.imageMaps;
				// @ts-ignore
				const imageCoordinates : Array<number> = o.imageCoordinates;
				// @ts-ignore
				const imageProvider = o.imageProvider;
				// @ts-ignore
				const imageScale = o.imageScale;
				// @ts-ignore
				const imagePixels = o.imagePixels;
				if (mesh && imageMaps && imageCoordinates && imageScale && imagePixels) {
					for (const [key, value] of Object.entries(imageMaps)) {
						// @ts-ignore
						const provider = (providers as unknown)[value as string] as MapProvider;
						const url = (x : number, y : number, z : number) => `/${providerFolder}/` + providerFile(x, y, z, provider.tileset, provider.format);
						const texture = textureLoader.load(url(imageCoordinates[0], imageCoordinates[1], imageCoordinates[2]));
						images.set(key, texture);
					}

					const pixelsPerMeter = (Math.cos((data.origin.lat ?? 0.0) * Math.PI / 180) *
							2 * Math.PI * 6378137
						)
						/ (imagePixels * imageScale);

					mesh.material = getMaterial(
						images,
						pixelsPerMeter,
						imageProvider
					);
				}
			});

			const center = data.projection([data.origin.lon, data.origin.lat])!;
			group.position.set(-center[0] * scale3d * 0.5, 0.0, -center[1] * scale3d * 0.5); // 0.5 since planes are centered.
			group.rotation.x = -Math.PI * 0.5;
			group.scale.set(scale3d, scale3d, scale3dVertical);
			scene.add(group);
		}

		THREE.DefaultLoadingManager.onLoad = function () {
			render();
		};

		render();
	}

	onMount(async () => {
		await init3d();
		attach3d();
	});
</script>

<AppTitle title={data.map.name} />

<main class="md:px-24 mx-4 2xl:mx-0">
	<div class="flex flex-row flex-wrap gap-4">
		<article class="flex-1 w-full flex flex-row sm:flex-col flex-wrap gap-4 p-4 bg-gray-50 rounded-lg dark:bg-gray-800 min-w-40">
			<Img src={data.map.image} alt="Original map photo" class="w-full h-auto rounded-lg object-center object-cover" />
			<div class="prose dark:prose-invert prose-a:text-primary-600 dark:prose-a:text-primary-500">{@html data.map.description}</div>
		</article>
		<div class="flex-[2] min-w-80">
			<Tabs>
				<TabItem open title="3D" on:click={() => attach3d()}>
					<div id="container-3d" class="w-full aspect-square" />
					<Attribution {attrMapbox} {attrOSM} />
				</TabItem>
				<TabItem title="2D">
					<svg viewBox="0 0 {data.map.height} {data.map.height}" class="w-full aspect-square">
						{@html data.data2d}
					</svg>
					<Attribution {attrMapbox} {attrOSM} />
				</TabItem>
			</Tabs>
		</div>
	</div>
</main>
