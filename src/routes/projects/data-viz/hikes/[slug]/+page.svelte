<script lang="ts">
	/* eslint-disable @typescript-eslint/ban-ts-comment */
	/* eslint-disable svelte/no-at-html-tags */
	import type { PageData } from './$types';
	import AppTitle from '$lib/components/AppTitle.svelte';
	import { Tabs, TabItem, Img, Breadcrumb, BreadcrumbItem } from 'flowbite-svelte';
	import Attribution from './Attribution.svelte';
	import { onMount } from 'svelte';
	import 'leaflet/dist/leaflet.css';
	import * as THREE from 'three';
	import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
	import { providerFile, providerFolder, providers } from '$lib/data/map-providers';
	import {
		type Feature,
		getMapFeatures,
		type MapProvider,
		type TilesData,
		type TilesMapsData
	} from '$lib/data/map-info';
	import { getDistance, getTime } from '$lib/hikes/build-statistics';
	import { detectMobileBrowser } from '$lib/components/detectmobilebrowser';
	import { primaryIndicatorColor, secondaryGeometryColor, secondaryIndicatorColor } from '$lib/hikes/build-geometry';
	import type { GeoJsonObject, Geometry } from 'geojson';
	import type { Layer } from 'leaflet';
	import SvelteMarkdown from 'svelte-markdown';
	import DefaultLink from '$lib/renderers/DefaultLink.svelte';
	import DefaultImage from '$lib/renderers/DefaultImage.svelte';
	import { MeshLineGeometry } from '$lib/hikes/meshline/MeshLineGeometry';
	import { MeshLineMaterial } from '$lib/hikes/meshline/MeshLineMaterial';
	import { TileMaterial } from '$lib/hikes/meshline/TileMaterial';
	import { MeshLineHikeMaterial } from '$lib/hikes/meshline/MeshLineHikeMaterial';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();

	const scale3d = 0.2;
	const scale3dVertical = 0.4;
	const statsIndicatorVerticalWidth = 1.0;

	const center = data.projection([data.origin.lon, data.origin.lat])!;
	const features = getMapFeatures(data.map) as Feature[];
	const attrMapbox = features.some((x) => x.type === 'Tiles' && (x.data as TilesData)!.provider!.includes('mapbox'));
	const attrOSM = features.some((x) => x.type === 'Tiles' && (x.data as TilesData)!.provider!.includes('osm'));

	let renderer : THREE.WebGLRenderer;
	let camera : THREE.PerspectiveCamera;
	let scene : THREE.Scene;
	let statsIndicator3d : THREE.Object3D;
	let statsIndicatorInteractive : any;
	let lastStatsIndicatorTarget : HTMLElement = $state();

	let isMobile = false;

	function render() {
		if (renderer && scene && camera) {
			renderer.render(scene, camera);
		}
	}

	async function attachInteractive() : Promise<void> {
		const { L } = await import('$lib/components/leaflet.almostover.js');

		const mapOsm = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
			maxZoom: 19,
			attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
		});
		const mapOsmLocal = (() => {
			const provider = providers.osm;
			return L.tileLayer(`/${providerFolder}/maps/${provider.tileset}/{z}_{x}_{y}.${provider.format}`, {
				maxZoom: 13,
				minZoom: 13,
				attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
			});
		})();
		const mapMapyczLocal = (() => {
			const provider = providers.mapyOutdoor;
			return L.tileLayer(`/${providerFolder}/maps/${provider.tileset}/{z}_{x}_{y}.${provider.format}`, {
				maxZoom: 13,
				minZoom: 13,
				attribution: '© <a href="https://o.seznam.cz" target="_blank" rel="noopener">Seznam.cz, a.s.</a>, 2025 and <a href="https://licence.mapy.cz/?doc=mapy_attr&amp;lang=en" data-others="1" target="_blank" rel="noopener">more</a>'
			});
		})();
		const mapSatelliteLocal = (() => {
			const provider = providers.mapboxSatellite;
			return L.tileLayer(`/${providerFolder}/maps/${provider.tileset}/{z}_{x}_{y}.${provider.format}`, {
				maxZoom: 13,
				minZoom: 13,
				attribution: '<a href="https://www.mapbox.com/about/maps/" target="_blank" title="Mapbox" aria-label="Mapbox">© Mapbox</a> <a href="https://www.openstreetmap.org/about/" target="_blank" title="OpenStreetMap" aria-label="OpenStreetMap">© OpenStreetMap</a> <a class="mapbox-improve-map" href="https://apps.mapbox.com/feedback/?owner=examples&amp;id=cke97f49z5rlg19l310b7uu7j&amp;access_token=pk.eyJ1IjoiZXhhbXBsZXMiLCJhIjoiY203eXd1a3ZzMGV1ejJrcHRvdnVoYng0NCJ9.NzlqpAcLHejzezQqazzI-w#/41/21/3" target="_blank" title="Improve this map" aria-label="Improve this map" rel="noopener nofollow">Improve this map</a>'
			});
		})();
		const baseMaps = {
			'OSM Mirror': mapOsmLocal,
			'Mapy.cz Outdoor': mapMapyczLocal,
			'Mapbox Satellite': mapSatelliteLocal,
			'OpenStreetMap': mapOsm,
		};
		const map = L.map('container-interactive', {
			almostOnMouseMove: false,
			almostDistance: 15,
			layers: [mapOsm],
		}).setView([data.origin.lat, data.origin.lon], 13);
		const controls = L.control.layers(baseMaps).addTo(map);
		const controlsContainer = controls.getContainer();
		if (controlsContainer) {
			function refocus() {
				const tempInputs = controlsContainer?.getElementsByTagName('input');
				for (let i = 0; i < tempInputs?.length ?? 0; ++i) {
					tempInputs[i].disabled = false;
				}
				map.setZoom(13);
			}

			controlsContainer.addEventListener('mouseover', refocus);
			controlsContainer.addEventListener('click', refocus);

			const inputs = controlsContainer.getElementsByTagName('input');
			if (inputs && inputs.length > 0) {
				for (let i = 0; i < inputs.length; ++i) {
					inputs[i].addEventListener('mouseover', refocus);
					inputs[i].addEventListener('click', refocus);
					inputs[i].addEventListener('change', refocus);
				}
			}
		}

		const staticColor = function(feature : Feature<Geometry, any> | undefined) {
			return {
				color: secondaryGeometryColor,
			};
		}
		const hikesLayer = L.geoJSON(data.dataGeometry as GeoJsonObject[], {
			style: staticColor,
			onEachFeature: function(feature: Feature<any, any>, layer: Layer) {
			}
		}).addTo(map);
		map.almostOver.addLayer(hikesLayer);

		statsIndicatorInteractive = new L.CircleMarker([data.origin.lat, data.origin.lon], {
			fillColor: secondaryIndicatorColor,
			color: secondaryIndicatorColor,
			fill: true,
			stroke: true,
			fillOpacity: 1,
			radius: 5,
		}).addTo(map);
		statsIndicatorInteractive.getElement()?.classList.add('hidden');

		onUpdateStatistics(lastStatsIndicatorTarget);
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
		const statsHeightIndicatorRect = statsHeightIndicator?.previousElementSibling as SVGRectElement | null;

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

		if (statsIndicatorInteractive) {
			const element = statsIndicatorInteractive.getElement();
			if (element) {
				element.classList.remove('hidden');
				statsIndicatorInteractive.setLatLng([y, x]);
			}
		}
	}

	function initStatistics() : void {
		const statsElement = document.getElementById('stats');
		const statsRects = document.getElementById('statsRects');

		if (!statsElement) {
			return;
		}

		statsElement.addEventListener('pointermove', (event) => {
			event.preventDefault();
			const ev = event as PointerEvent;

			if (statsRects) {
				const rect = statsElement.getBoundingClientRect();
				const localX = (ev.clientX - rect.left) / rect.width;
				const childIndex = Math.floor(localX * statsRects.childElementCount);
				const elem = statsRects.childElementCount > childIndex
					? statsRects.children.item(childIndex) as HTMLElement
					: null;
				if (elem) { onUpdateStatistics(elem); }
			} else {
				const elems = document.elementsFromPoint(ev.clientX, ev.clientY).filter((x) => x.tagName === 'rect');
				if (elems.length > 0) { onUpdateStatistics(elems[0] as HTMLElement); }
			}
		}, false);
		statsElement.addEventListener('touchmove', (event) => {
			event.preventDefault();
			const ev = event as TouchEvent;
			const touch = ev.touches[0];

			if (statsRects) {
				const rect = statsElement.getBoundingClientRect();
				const localX = (touch.clientX - rect.left) / rect.width;
				const childIndex = Math.floor(localX * statsRects.childElementCount);
				const elem = statsRects.childElementCount > childIndex
					? statsRects.children.item(childIndex) as HTMLElement
					: null;
				if (elem) { onUpdateStatistics(elem); }
			} else {
				const elems = document.elementsFromPoint(touch.clientX, touch.clientY).filter((x) => x.tagName === 'rect');
				if (elems.length > 0) { onUpdateStatistics(elems[0] as HTMLElement); }
			}
		}, false);
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
				const wElement = document.getElementById('content');
				const resolution = wElement
					? new THREE.Vector2(wElement.offsetWidth, wElement.offsetWidth)
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
				const oLayer = o.layer;
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
								data.pixelsPerMeter,
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
								data.pixelsPerMeter,
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
								data.pixelsPerMeter,
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
				const sphere = new THREE.SphereGeometry((isMobile ? 4.0 : 2.0) * data.map.height / data.tileScale);
				const sphereMesh = new THREE.Mesh(sphere, new THREE.MeshBasicMaterial({
					color: primaryIndicatorColor,
					depthTest: true,
				}));
				sphereMesh.scale.set(1., 1., scale3dVertical);
				sphereMesh.position.setZ(offset / scale3dVertical);
				statsIndicator3d.add(sphereMesh);

				const wElement = document.getElementById('content');
				const resolution = wElement
					? new THREE.Vector2(wElement.offsetWidth, wElement.offsetWidth)
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

	onMount(async () => {
		isMobile = detectMobileBrowser();
		await init3d();
		attach3d();
		//await attachInteractive();
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
				<Img src={data.map.image?.replace('/hikes/', '/hikes/thumb/')} alt="Original map photo" class="w-full aspect-crt rounded-lg object-center object-cover" />
				<div class="prose dark:prose-invert prose-a:text-primary-600 dark:prose-a:text-primary-500">
					<p>{@html data.map.description}</p>
					<ul>
						<li>Distance: {getDistance(data.properties.distance ?? 0)}</li>
						<li>Duration: {getTime(data.properties.duration ?? 0)}<sup>*</sup></li>
						<li>Ascent: {getDistance(data.properties.ascent ?? 0)}</li>
						<li>Descent: {getDistance(data.properties.descent ?? 0)}</li>
						<li>Dates: {data.properties.dates.map((x) => new Date(x.date).toLocaleDateString('en-us', { year:"numeric", month:"short", day:"numeric"})).join('; ')}</li>
						<li><a href={data.properties.filePath}>{data.properties.fileType}</a>, <a href={data.gpxPath}>GPX</a></li>
					</ul>
					<span>
						* The duration of the hike is pure walking time with above average speed.
					</span>
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
				<TabItem open title="3D" onclick={() => { setTimeout(async () => { await init3d(); attach3d(); }) }}>
					<div id="content" class="w-full h-auto">
						<div id="container-3d" class="w-full aspect-square"></div>
						<Attribution {attrMapbox} {attrOSM} />
					</div>
				</TabItem>
				<TabItem title="2D" onclick={() => onUpdateStatistics(lastStatsIndicatorTarget)}>
					<svg viewBox="0 0 {data.map.height} {data.map.height}" class="w-full aspect-square">
						{@html data.data2d}
						<circle id="statsIndicator2d" r={data.map.height * 0.125 * 0.125 * 0.5} fill={secondaryIndicatorColor} class="hidden" />
					</svg>
					<Attribution attrMapbox={false} {attrOSM} />
				</TabItem>
				<TabItem title="Interactive" onclick={async () => await attachInteractive()}>
					<div class="overflow-hidden aspect-square">
						<div id="container-interactive" class="w-full aspect-square"></div>
					</div>
				</TabItem>
			</Tabs>
		</div>
		{#if data.posts.length > 0}
			<div class="w-full p-4 bg-gray-50 rounded-lg dark:bg-gray-800">
				{#each data.posts as postItem}
					<article class="max-w-full prose dark:prose-invert">
						<h2>Hike on {new Date(postItem.date).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}</h2>
						<SvelteMarkdown source={postItem.post} renderers={{ link: DefaultLink, image: DefaultImage }} />
					</article>
				{/each}
			</div>
		{/if}
	</div>
</main>
