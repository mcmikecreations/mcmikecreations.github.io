<script lang="ts">
	/* eslint-disable @typescript-eslint/ban-ts-comment */
	/* eslint-disable svelte/no-at-html-tags */
	import type { PageData } from './$types';
	import AppTitle from '$lib/components/AppTitle.svelte';
	import { Tabs, TabItem, Img, Breadcrumb, BreadcrumbItem } from 'flowbite-svelte';
	import Attribution from './Attribution.svelte';
	import { onMount } from 'svelte';
	import * as THREE from 'three';
	import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
	import { providerFile, providerFolder, providers } from '$lib/data/map-providers';
	import { type Feature, getMapFeatures, type MapProvider, type TilesData } from '$lib/data/map-info';
	import { getDistance, getTime } from './build-statistics';
	import { detectMobileBrowser } from '$lib/components/detectmobilebrowser';
	import { primaryIndicatorColor, secondaryIndicatorColor } from './build-geometry';

	export let data: PageData;

	const scale3d = 0.2;
	const scale3dVertical = 0.4;
	const statsIndicatorVerticalWidth = 1.0;

	const center = data.projection([data.origin.lon, data.origin.lat])!;
	const features = getMapFeatures(data.map) as Feature[];
	const attrMapbox = features.some((x) => x.type === 'Tiles' && (x.data as TilesData)!.provider!.includes('mapbox'));
	const attrOSM = features.some((x) => x.type === 'Tiles' && (x.data as TilesData)!.provider!.includes('osm')) && !attrMapbox;

	let renderer : THREE.WebGLRenderer;
	let camera : THREE.PerspectiveCamera;
	let scene : THREE.Scene;
	let statsIndicator3d : THREE.Object3D;
	let lastStatsIndicatorTarget : HTMLElement;

	let isMobile = false;

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
		onUpdateStatistics(lastStatsIndicatorTarget);
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

	function onUpdateStatistics(target : HTMLElement) : void {
		if (!target) {
			return;
		}

		lastStatsIndicatorTarget = target;
		const statsIndicator = document.getElementById('statsIndicator') as (SVGCircleElement | null);
		const statsIndicatorVertical = document.getElementById('statsIndicatorVertical') as (SVGLineElement | null);
		const x = parseFloat(target.getAttribute('data-x') ?? '0');
		const y = parseFloat(target.getAttribute('data-y') ?? '0');
		const z = parseFloat(target.getAttribute('data-z') ?? '0');
		const h = parseFloat(target.getAttribute('data-h') ?? '0');
		const projected = data.projection([x, y])!;
		const elemX = target.getAttribute('x') ?? '0';
		if (statsIndicator) {
			statsIndicator.classList.remove('hidden');
			statsIndicator.setAttribute('cx', elemX);
			statsIndicator.setAttribute('cy', h.toString());
		}
		if (statsIndicatorVertical) {
			statsIndicatorVertical.classList.remove('hidden');
			statsIndicatorVertical.setAttribute('x1', elemX);
			statsIndicatorVertical.setAttribute('x2', elemX);
		}

		const statsHeightIndicator = document.getElementById('statsHeightIndicator') as SVGTextElement | null;
		const statsHeightIndicatorRect = statsHeightIndicator?.previousSibling as SVGRectElement | null;

		if (statsHeightIndicator && statsHeightIndicatorRect) {
			const offset = 5.0;
			const newX = parseFloat(elemX) - offset;
			statsHeightIndicator.innerHTML = `${z.toFixed(1)} m`;

			const bbox = statsHeightIndicator.getBBox();
			const rectWidth = bbox.width + 2.0 * offset;
			const rectStart = newX - bbox.width - offset - statsIndicatorVerticalWidth * 0.5;

			statsHeightIndicatorRect.setAttribute('width', String(rectWidth));

			if (rectStart >= statsIndicatorVerticalWidth * 0.5) {
				statsHeightIndicator.setAttribute('x', String(newX));
				statsHeightIndicatorRect.setAttribute('x', String(rectStart));
			}
			else {
				statsHeightIndicator.setAttribute('x', String(statsIndicatorVerticalWidth * 0.5 + bbox.width + offset));
				statsHeightIndicatorRect.setAttribute('x', String(statsIndicatorVerticalWidth * 0.5));
			}
		}

		const statsIndicator2d = document.getElementById('statsIndicator2d') as (SVGCircleElement | null);
		if (statsIndicator2d) {
			statsIndicator2d.classList.remove('hidden');
			statsIndicator2d.setAttribute('cx', projected[0].toString());
			statsIndicator2d.setAttribute('cy', projected[1].toString());
		}

		if (statsIndicator3d) {
			const scale = data.tileScale;
			statsIndicator3d.position.set(projected[0] - scale * 0.5, -projected[1] + scale * 0.5, z * data.pixelsPerMeter);
			statsIndicator3d.visible = true;
			render();
		}
	}

	function initStatistics() : void {
		const statsElement = document.getElementById('stats');

		if (!statsElement) {
			return;
		}

		statsElement.addEventListener('pointermove', (event) => {
			event.preventDefault();
			const ev = event as PointerEvent;
			const elems = document.elementsFromPoint(ev.clientX, ev.clientY).filter((x) => x.tagName === 'rect');
			if (elems.length > 0) { onUpdateStatistics(elems[0] as HTMLElement); }
		}, false);
		statsElement.addEventListener('touchmove', (event) => {
			event.preventDefault();
			const ev = event as TouchEvent;
			const touch = ev.touches[0];
			const elems = document.elementsFromPoint(touch.clientX, touch.clientY).filter((x) => x.tagName === 'rect');
			if (elems.length > 0) { onUpdateStatistics(elems[0] as HTMLElement); }
		}, false);
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
						const url = (x : number, y : number, z : number) => `/${providerFolder}/maps/` + providerFile(x, y, z, provider.tileset, provider.format);
						const texture = textureLoader.load(url(imageCoordinates[0], imageCoordinates[1], imageCoordinates[2]));
						images.set(key, texture);
					}

					mesh.material = getMaterial(
						images,
						data.pixelsPerMeter,
						imageProvider
					);
				}
			});

			const sphere = new THREE.SphereGeometry((isMobile ? 4.0 : 2.0) * data.map.height / data.tileScale);

			statsIndicator3d = new THREE.Mesh(sphere, new THREE.MeshBasicMaterial({
				color: primaryIndicatorColor,
				depthTest: false,
			}));
			statsIndicator3d.renderOrder = 900;
			statsIndicator3d.scale.set(1., 1., scale3dVertical);
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

	onMount(async () => {
		isMobile = detectMobileBrowser();
		await init3d();
		attach3d();
		initStatistics();
	});
</script>

<AppTitle title={data.map.name} />

<main>
	<Breadcrumb class="mb-4" aria-label="Route" solid>
		<BreadcrumbItem href="/" home>Home</BreadcrumbItem>
		<BreadcrumbItem href="/projects">Projects</BreadcrumbItem>
		<BreadcrumbItem href="/projects/data-viz">Data Viz</BreadcrumbItem>
		<BreadcrumbItem>{(data.map.properties.draft ? '⏳ ' : '') + data.map.name}</BreadcrumbItem>
	</Breadcrumb>
	<div class="flex flex-row flex-wrap gap-4">
		<article class="flex-1 w-full p-4 bg-gray-50 rounded-lg dark:bg-gray-800 min-w-40">
			<div class="flex flex-row sm:flex-col flex-wrap gap-4">
				<Img src={data.map.image} alt="Original map photo" class="w-full aspect-crt rounded-lg object-center object-cover" />
				<div class="prose dark:prose-invert prose-a:text-primary-600 dark:prose-a:text-primary-500">
					<p>{@html data.map.description}</p>
					<ul>
						<li>Distance: {getDistance(data.properties.distance ?? 0)}</li>
						<li>Duration: {getTime(data.properties.duration ?? 0)}</li>
						<li>Ascent: {getDistance(data.properties.ascent ?? 0)}</li>
						<li>Descent: {getDistance(data.properties.descent ?? 0)}</li>
						<li>Dates: {data.properties.dates.map((x) => new Date(x).toLocaleDateString('en-us', { year:"numeric", month:"short", day:"numeric"})).join('; ')}</li>
						<li><a href={data.properties.filePath}>{data.properties.fileType}</a></li>
					</ul>
				</div>
			</div>
			{#if data.statistics}
				<div class="flex-1 mt-4">
					<svg id="stats" viewBox="0 0 {data.map.height * 0.5} {data.map.height * 0.125}" class="w-full overflow-visible prose dark:prose-invert max-w-none">
						<line id="statsIndicatorVertical" y1="-7.5" y2={data.map.height * 0.125 + 7.5} stroke={secondaryIndicatorColor} stroke-width={statsIndicatorVerticalWidth} class="hidden" />
						{@html data.statistics}
						<circle id="statsIndicator" r={data.map.height * 0.125 * 0.125 * 0.5} fill={secondaryIndicatorColor} class="hidden" />
					</svg>
				</div>
			{/if}
		</article>
		<div class="flex-[2] min-w-80">
			<Tabs>
				<TabItem open title="3D" on:click={() => attach3d()}>
					<div id="container-3d" class="w-full aspect-square" />
					<Attribution {attrMapbox} {attrOSM} />
				</TabItem>
				<TabItem title="2D" on:click={() => onUpdateStatistics(lastStatsIndicatorTarget)}>
					<svg viewBox="0 0 {data.map.height} {data.map.height}" class="w-full aspect-square">
						{@html data.data2d}
						<circle id="statsIndicator2d" r={data.map.height * 0.125 * 0.125 * 0.5} fill={secondaryIndicatorColor} class="hidden" />
					</svg>
					<Attribution {attrMapbox} {attrOSM} />
				</TabItem>
			</Tabs>
		</div>
	</div>
</main>
