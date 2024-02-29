<script lang="ts">
	import type { PageData } from './$types';
	import AppTitle from '$lib/components/AppTitle.svelte';
	import { P, Tabs, TabItem } from 'flowbite-svelte';
	import Attribution from './Attribution.svelte';
	import { onMount } from 'svelte';
	import * as THREE from 'three';
	import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
	import { providerFile, providerFolder, providers } from '$lib/data/map-providers';

	export let data: PageData;

	const attributionHeight = 18;
	const scale3d = 0.2;
	const scale3dVertical = 2.0;

	const attrMapbox = data.map.features.some((x) => x.type === 'Tiles' && x.data!.provider!.includes('mapbox'));
	const attrOSM = data.map.features.some((x) => x.type === 'Tiles' && x.data!.provider!.includes('osm')) && !attrMapbox;

	let renderer : THREE.WebGLRenderer;

	function attach3d() : void {
		const container = document.getElementById('container-3d')!;
		container.appendChild(renderer.domElement);
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

		const camera = new THREE.PerspectiveCamera(50, container.offsetWidth / container.offsetHeight, 1, 1000);
		camera.position.set( 200, 200, 200 );

		renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
		renderer.setPixelRatio(window.devicePixelRatio);
		renderer.setSize(container.offsetWidth, container.offsetHeight);

		const controls = new OrbitControls(camera, renderer.domElement);
		controls.addEventListener('change', render);
		controls.screenSpacePanning = true;
		window.addEventListener('resize', onWindowResize);

		const scene = new THREE.Scene();

		const helper = new THREE.GridHelper(160, 10, 0x8d8d8d, 0xc1c1c1);
		scene.add(helper);

		const axesHelper = new THREE.AxesHelper(500);
		scene.add(axesHelper);

		//const light = new THREE.DirectionalLight('white', 8);
		//light.position.set(100, 100, 100);
		//scene.add(light);

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
						const provider = providers[value as string];
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
						pixelsPerMeter * scale3dVertical,
						imageProvider
					);
				}
			});

			const center = data.projection([data.origin.lon, data.origin.lat])!;
			group.position.set(-center[0] * scale3d * 0.5, 0.0, -center[1] * scale3d * 0.5); // 0.5 since planes are centered.
			group.rotation.x = -Math.PI * 0.5;
			group.scale.set(scale3d, scale3d, scale3d);
			scene.add(group);
		}

		function onWindowResize() {
			camera.aspect = container.offsetWidth / container.offsetHeight;
			camera.updateProjectionMatrix();

			renderer.setSize(container.offsetWidth, container.offsetHeight);
			render();
		}

		function render() {
			renderer.render(scene, camera);
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
		<article class="flex-1 w-full flex flex-row sm:flex-col flex-wrap p-4 bg-gray-50 rounded-lg dark:bg-gray-800 min-w-40">

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
