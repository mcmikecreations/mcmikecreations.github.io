<script lang="ts">
	/* eslint-disable @typescript-eslint/ban-ts-comment */
	import Attribution from './Attribution.svelte';
	import type { Map3dParameters } from '$lib/hikes/Map3dParameters';
	import type { MapProvider, TilesMapsData } from '$lib/data/map-info';
	import * as THREE from 'three';
	import { providerFile, providerFolder, providers } from '$lib/data/map-providers';
	import { primaryIndicatorColor } from '$lib/hikes/build-geometry';
	import { TileMaterial } from '$lib/hikes/meshline/TileMaterial';
	import { MeshLineHikeMaterial } from '$lib/hikes/meshline/MeshLineHikeMaterial';
	import { MeshLineGeometry } from '$lib/hikes/meshline/MeshLineGeometry';
	import { MeshLineMaterial } from '$lib/hikes/meshline/MeshLineMaterial';
	import { onDestroy, onMount } from 'svelte';
	import { detectMobileBrowser } from '$lib/components/detectmobilebrowser';
	import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

	interface Props {
		parameters: Map3dParameters;
		contentElement: HTMLElement | undefined;
		refresh: (() => Promise<void>) | undefined;
		updateIndicator: ((x: number, y: number, z: number) => void) | undefined;
	}

	let {
		parameters,
		contentElement,
		refresh = $bindable(),
		updateIndicator = $bindable(),
	}: Props = $props();
	let {
		attrMapbox,
		attrOSM,
		origin,
		projection,
		map,
		tileScale,
		pixelsPerMeter,
		data3d,
	} = $derived(parameters);

	const scale3d = 0.2;
	const scale3dVertical = 0.4;

	const center = $derived(projection([origin.lon, origin.lat])!);

	let renderer : THREE.WebGLRenderer;
	let camera : THREE.PerspectiveCamera;
	let scene : THREE.Scene;
	let statsIndicator3d : THREE.Object3D;
	let container : HTMLElement | undefined = $state();

	let isMobile = false;

	function render() {
		if (renderer && scene && camera) {
			renderer.render(scene, camera);
		}
	}

	function attach3d() : void {
		if (renderer && container) {
			for (let i = container.children.length - 1; i >= 0; --i) {
				if (container.children[i].tagName === 'canvas') {
					container.children[i].remove();
				}
			}
			container.appendChild(renderer.domElement);
		}

		onWindowResize();
	}

	function onWindowResize() {
		if (camera && renderer && container) {
			const containerSize = container.offsetWidth;
			camera.aspect = containerSize / containerSize;
			camera.updateProjectionMatrix();

			renderer.setSize(containerSize, containerSize);
		}

		render();
	}

	function myUpdateIndicator(x: number, y: number, z: number): void {
		if (statsIndicator3d) {
			statsIndicator3d.position.set(x, y, z);
			statsIndicator3d.visible = true;
			render();
		}
	}

	async function init3d() : Promise<void> {
		function getMaterial(
			kind : 'tile' | 'basic' | 'meshline',
			textures : Map<string, THREE.Texture>,
			imageScale : number,
			imageProvider : string,
			tileSize : number,
			includeDisplacement : boolean = false,
			uvFromPosition : boolean = false,
			colorFromUv : boolean = false,
			depthTest : boolean = true,
			offsetY : number = 0.0,
		) : THREE.Material {
			if (kind === 'tile' && imageProvider === 'mapboxDEM') {
				return new TileMaterial({
					diffuseTexture: textures.get('diffuse')!,
					displacementTexture: textures.get('displacement')!,
					tOffset: offsetY,
					tTileSize: tileSize,
					tScale: imageScale,
					uvFromPosition: uvFromPosition,
					colorFromUv: colorFromUv,
					includeDisplacement: includeDisplacement,
				});
			} else if (kind === 'meshline') {
				const resolution = contentElement
					? new THREE.Vector2(contentElement.offsetWidth, contentElement.offsetWidth)
					: new THREE.Vector2(512, 512);
				//const resolution = new THREE.Vector2(renderer.domElement.offsetWidth, renderer.domElement.offsetWidth);
				return new MeshLineHikeMaterial({
					tScale: imageScale,
					tTileSize: tileSize,
					tOffset: offsetY,
					tDisplacement: textures.get('displacement')!,
					depthTest: depthTest,
					map: textures.get('diffuse')!,
					useMap: 1,
					resolution: resolution,
					lineWidth: 2,
				});
			} else {
				return new THREE.MeshBasicMaterial({
					map: textures.get('diffuse'),
					depthTest: depthTest,
					polygonOffset: offsetY === 0.0,
					polygonOffsetFactor: offsetY === 0.0 ? undefined : -1,
					polygonOffsetUnits: offsetY === 0.0 ? undefined : -4,
				});
			}
		}

		const containerSize = container?.offsetWidth ?? 512;

		camera = new THREE.PerspectiveCamera(45, 1.0 /* w/h */, 1, 1000);
		const cameraPos = map.height * 0.25;
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

		if (data3d.length > 0) {
			const group = new THREE.Group();
			group.add(...data3d);

			const textureLoader = new THREE.TextureLoader();
			group.traverse((o : THREE.Object3D) => {
				const images = new Map<string, THREE.Texture>();
				// @ts-ignore
				const imageMaps : TilesMapsData | undefined = o.imageMaps;
				// @ts-ignore
				const imageCoordinates : Array<number> = o.imageCoordinates;
				// @ts-ignore
				const imageProvider = o.imageProvider;
				// @ts-ignore
				const imageScale = o.imageScale;
				// @ts-ignore
				const imagePixels = o.imagePixels;
				// @ts-ignore
				const oLayer = o.imageLayer;
				if (imageMaps && imageCoordinates && imageScale && imagePixels) {
					for (const [key, value] of Object.entries(imageMaps)) {
						if (value.startsWith('#')) {
							const m = value.match(/^#([0-9a-f]{6})$/i)[1];
							const color = m
								? [
									parseInt(m.slice(0,2),16),
									parseInt(m.slice(2,4),16),
									parseInt(m.slice(4,6),16),
									255
								] : [255, 0, 0, 255];
							const solidRedTexture = new THREE.DataTexture(
								new Uint8Array(color),
								1,
								1,
								THREE.RGBAFormat
							);
							solidRedTexture.needsUpdate = true;
							images.set(key, solidRedTexture);
						} else {
							let localImageUrl = undefined; // imageUrl
							if (!localImageUrl) {
								// @ts-ignore
								const provider = (providers as unknown)[value as string] as MapProvider;
								const url = (x : number, y : number, z : number) => `/${providerFolder}/maps/` + providerFile(x, y, z, provider.tileset, provider.format);
								localImageUrl = url(imageCoordinates[0], imageCoordinates[1], imageCoordinates[2]);
								// console.log('Failed to find image url ', localImageUrl, ' locally for ', o);
							}
							const texture = textureLoader.load(
								localImageUrl,
								(texture) => {
									// Set texture filtering
									texture.minFilter = THREE.LinearFilter;
									texture.magFilter = THREE.LinearFilter;
								}
							);
							images.set(key, texture);
						}
					}

					if (oLayer === 'Tiles' && o.type === 'Mesh') {
						const mesh = o as THREE.Mesh;
						if (mesh) {
							mesh.material = getMaterial(
								'tile',
								images,
								pixelsPerMeter,
								imageProvider,
								imagePixels,
								true,
								false,
								false,
								true,
								0.0
							);
						}
					} else if (oLayer === 'Geometry' && o.type === 'Line') {
						const line = o as THREE.Line;
						if (line) {
							line.material = getMaterial(
								'tile',
								images,
								pixelsPerMeter,
								imageProvider,
								imagePixels,
								true,
								true,
								false,
								true,
								1.0
							);
						}
					} else if (oLayer === 'Geometry' && o.type === 'Mesh') {
						const line = o as THREE.Mesh;
						if (line) {
							line.material = getMaterial(
								'meshline',
								images,
								pixelsPerMeter,
								imageProvider,
								imagePixels,
								true,
								true,
								false,
								true,
								1.0
							);
						}
					}
				}
			});

			statsIndicator3d = new THREE.Group();
			{
				const offset = 20.0;
				const sphere = new THREE.SphereGeometry((isMobile ? 4.0 : 2.0) * map.height / tileScale);
				const sphereMesh = new THREE.Mesh(sphere, new THREE.MeshBasicMaterial({
					color: primaryIndicatorColor,
					depthTest: true,
				}));
				sphereMesh.scale.set(1., 1., scale3dVertical);
				sphereMesh.position.setZ(offset / scale3dVertical);
				statsIndicator3d.add(sphereMesh);

				const resolution = contentElement
					? new THREE.Vector2(contentElement.offsetWidth, contentElement.offsetWidth)
					: new THREE.Vector2(512, 512);
				const line = new MeshLineGeometry().setFromPoints( [
					new THREE.Vector3(0,0,-1),
					new THREE.Vector3(0,0,offset / scale3dVertical),
				] );
				const lineMesh = new THREE.Mesh(line, new MeshLineMaterial({
					color: primaryIndicatorColor,
					resolution: resolution,
					lineWidth: 2.5,
				}));
				statsIndicator3d.add(lineMesh);
			}
			statsIndicator3d.renderOrder = 900;
			statsIndicator3d.visible = false;
			group.add(statsIndicator3d);

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

	async function myrefresh() {
		[...document.getElementsByClassName('container3d')]
			.flatMap(el => [...el.children])
			.filter(el => el.tagName === 'CANVAS')
			.map(el => {console.log(el); el.remove();});
		if (container) {
			isMobile = detectMobileBrowser();
			await init3d();
			attach3d();
		}
	}

	refresh = myrefresh;
	updateIndicator = myUpdateIndicator;

	onMount(async () => {
		await myrefresh();
	});

	onDestroy(() => {
		renderer?.domElement?.remove();
		container?.remove();
	});
</script>

<div bind:this={container} class="w-full aspect-square container3d"></div>
<Attribution {attrMapbox} {attrOSM} />
