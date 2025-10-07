<script lang="ts">
	import type { PageData } from './$types';
	import { Breadcrumb, BreadcrumbItem, Card, Heading, A } from 'flowbite-svelte';
	import SvelteMarkdown from 'svelte-markdown';
	import type { Token, Tokens } from 'marked';
	import DefaultCode from '$lib/renderers/DefaultCode.svelte';
	import DefaultLink from '$lib/renderers/DefaultLink.svelte';
	import ToTopButton from '$lib/components/ToTopButton.svelte';
	import DefaultImage from '$lib/renderers/DefaultImage.svelte';
	import AppFooter from '$lib/components/AppFooter.svelte';
	import { getDistance, getTime } from '../../projects/data-viz/hikes/[slug]/build-statistics';
	import Attribution from '../../projects/data-viz/hikes/[slug]/Attribution.svelte';
	import type { Feature, MapProvider, TilesData } from '$lib/data/map-info';
	import { providerFile, providerFolder, providers } from '$lib/data/map-providers';
	import type { GeoJsonObject, Geometry, Feature as F } from 'geojson';
	import {
		primaryIndicatorColor,
		secondaryGeometryColor,
		secondaryIndicatorColor
	} from '../../projects/data-viz/hikes/[slug]/build-geometry';
	import type { Layer } from 'leaflet';
	import { onMount } from 'svelte';
	import { detectMobileBrowser } from '$lib/components/detectmobilebrowser';
	import 'leaflet/dist/leaflet.css';
	import * as THREE from 'three';
	import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
	import AppMeta from '$lib/components/AppMeta.svelte';
	import resume from '$lib/data/resume.json';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();
	const predicate = (to: Token, index: number, startFrom: number) =>
		index > startFrom &&
		to.type === 'paragraph' &&
		to.tokens &&
		(
			data.post.content.length <= index + 1 ||
			(
				data.post.content[index + 1].type === 'paragraph' &&
				(data.post.content[index + 1] as Tokens.Paragraph).tokens &&
				!(data.post.content[index + 1] as Tokens.Paragraph).tokens.some(t => t.type === 'image')
			) ||
			( // Sometimes marked inserts a space token.
				data.post.content.length > index + 2 &&
				data.post.content[index + 2].type === 'paragraph' &&
				(data.post.content[index + 2] as Tokens.Paragraph).tokens &&
				!(data.post.content[index + 2] as Tokens.Paragraph).tokens.some(t => t.type === 'image')
			)
		);
	const map2dIndex = data.post.content.findIndex((to, index) => predicate(to, index, -1));
	const map3dIndex = data.post.content.findIndex((to, index) => predicate(to, index, map2dIndex));
	const renderers = { code: DefaultCode, link: DefaultLink, image: DefaultImage };

	interface File {
		path: string;
		type: string;
	}
	const filePrimary: File = {
		path: data.map.properties.filePath,
		type: data.map.properties.fileType
	};
	const fileGpx: File = {
		path: data.map.properties.filePath.replace('geojson', 'gpx').replace('json', 'gpx'),
		type: 'GPX'
	};

	const scale3d = 0.2;
	const scale3dVertical = 0.4;
	const statsIndicatorVerticalWidth = 1.0;

	const center = data.mapDisplay.projection([data.mapDisplay.origin.lon, data.mapDisplay.origin.lat])!;
	const features = data.mapDisplay.features!;
	const attrMapbox = features.some((x: Feature) => x.type === 'Tiles' && (x.data as TilesData)!.provider!.includes('mapbox'));
	const attrOSM = features.some((x: Feature) => x.type === 'Tiles' && (x.data as TilesData)!.provider!.includes('osm'));

	let renderer : THREE.WebGLRenderer;
	let camera : THREE.PerspectiveCamera;
	let scene : THREE.Scene;
	let statsIndicator3d : THREE.Object3D;
	let statsIndicatorInteractive : any;
	let lastStatsIndicatorTarget : HTMLElement | undefined = $state();
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
		}).setView([data.mapDisplay.origin.lat, data.mapDisplay.origin.lon], 12);
		const controls = L.control.layers(baseMaps).addTo(map);
		const controlsContainer = controls.getContainer();
		if (controlsContainer) {
			function refocus() {
				const tempInputs = controlsContainer?.getElementsByTagName('input');
				if (tempInputs) {
					for (let i = 0; i < tempInputs.length; ++i) {
						tempInputs[i].disabled = false;
					}
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

		const staticColor = function(feature : F<Geometry, any> | undefined) {
			return {
				color: secondaryGeometryColor,
			};
		}
		const hikesLayer = L.geoJSON(data.mapDisplay.dataGeometry as GeoJsonObject[], {
			style: staticColor,
			onEachFeature: function(feature: F<any, any>, layer: Layer) {
			}
		}).addTo(map);
		map.almostOver.addLayer(hikesLayer);

		statsIndicatorInteractive = new L.CircleMarker([data.mapDisplay.origin.lat, data.mapDisplay.origin.lon], {
			fillColor: secondaryIndicatorColor,
			color: secondaryIndicatorColor,
			fill: true,
			stroke: true,
			fillOpacity: 1,
			radius: 5,
		}).addTo(map);
		statsIndicatorInteractive.getElement()?.classList.add('hidden');

		if (lastStatsIndicatorTarget) {
			onUpdateStatistics(lastStatsIndicatorTarget);
		}
	}

	function attach3d() : void {
		if (renderer) {
			const container = document.getElementById('container-3d');
			container?.appendChild(renderer.domElement);
		}

		onWindowResize();
		if (lastStatsIndicatorTarget) {
			onUpdateStatistics(lastStatsIndicatorTarget);
		}
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
		const allStatsIndicator = document.getElementsByClassName('statsIndicator');
		const allStatsIndicatorVertical = document.getElementsByClassName('statsIndicatorVertical');

		const x = parseFloat(target.getAttribute('data-x') ?? '0');
		const y = parseFloat(target.getAttribute('data-y') ?? '0');
		const z = parseFloat(target.getAttribute('data-z') ?? '0');
		const h = parseFloat(target.getAttribute('data-h') ?? '0');
		const projected = data.mapDisplay.projection([x, y])!;
		const elemX = target.getAttribute('x') ?? '0';

		for (let t = 0; t < allStatsIndicatorVertical.length; ++t) {
			const statsIndicatorVertical = allStatsIndicatorVertical[t];
			if (statsIndicatorVertical) {
				statsIndicatorVertical.classList.remove('hidden');
				statsIndicatorVertical.setAttribute('x1', elemX);
				statsIndicatorVertical.setAttribute('x2', elemX);
			}
		}
		for (let t = 0; t < allStatsIndicator.length; ++t) {
			const statsIndicator = allStatsIndicator[t];
			if (statsIndicator) {
				statsIndicator.classList.remove('hidden');
				statsIndicator.setAttribute('cx', elemX);
				statsIndicator.setAttribute('cy', h.toString());
			}
		}

		const allStatsHeightIndicators = document.getElementsByClassName('statsHeightIndicator');
		for (const statsHeightIndicator of allStatsHeightIndicators) {
			const statsHeightIndicatorRect = statsHeightIndicator?.previousElementSibling as SVGRectElement | null;

			if (statsHeightIndicator && statsHeightIndicatorRect) {
				const offset = 5.0;
				const newX = parseFloat(elemX) - offset;
				statsHeightIndicator.innerHTML = `${z.toFixed(1)} m`;

				const bbox = (statsHeightIndicator as SVGTextElement).getBBox();
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
		}

		const statsIndicator2d = document.getElementById('statsIndicator2d') as (SVGCircleElement | null);
		if (statsIndicator2d) {
			statsIndicator2d.classList.remove('hidden');
			statsIndicator2d.setAttribute('cx', projected[0].toString());
			statsIndicator2d.setAttribute('cy', projected[1].toString());
		}

		if (statsIndicator3d) {
			const scale = data.mapDisplay.tileScale;
			statsIndicator3d.position.set(projected[0] - scale * 0.5, -projected[1] + scale * 0.5, z * data.mapDisplay.pixelsPerMeter);
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
		const statsElements = document.getElementsByClassName('stats');
		const statsRects = document.getElementById('statsRects');

		for (const statsElement of statsElements) {
			if (!statsElement) {
				continue;
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

		if (data.mapDisplay.data3d.length > 0) {
			const group = new THREE.Group();
			group.add(...data.mapDisplay.data3d);

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
						data.mapDisplay.pixelsPerMeter,
						imageProvider
					);
				}
			});

			const sphere = new THREE.SphereGeometry((isMobile ? 4.0 : 2.0) * data.map.height / data.mapDisplay.tileScale);

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
		await attachInteractive();
		initStatistics();
	});
</script>

<AppMeta
	title={data.post.title + ' Hike'}
	description={data.post.description ?? undefined}
	image={data.post.image}
	type="article"
	tags={data.post.tags}
	article-published_time="{data.post.date}T16:00:00+00:00"
	article-author={resume.basics.name}
	article-section="Hikes"
/>

{#snippet statsSnippet()}
	{#if data.mapDisplay.statistics}
		<div class="flex-1 mt-4">
			<svg
				style="height: auto; width: 100%; aspect-ratio: {data.mapDisplay.statisticsSizePixels[0]/data.mapDisplay.statisticsSizePixels[1]};"
				class="stats mx-auto max-w-full overflow-visible prose dark:prose-invert"
				preserveAspectRatio="none"
				viewBox="0 0 {data.mapDisplay.statisticsSizePixels[0]} {data.mapDisplay.statisticsSizePixels[1]}"
			>
				<line class="statsIndicatorVertical hidden" y1="-7.5" y2={data.mapDisplay.statisticsSizePixels[1] + 7.5} stroke={secondaryIndicatorColor} stroke-width={statsIndicatorVerticalWidth} />
				{@html data.mapDisplay.statistics}
				<circle class="statsIndicator hidden" r={data.mapDisplay.statisticsSizePixels[1] * 0.125 * 0.5} fill={secondaryIndicatorColor} />
			</svg>
		</div>
	{/if}
{/snippet}

<div class="container mx-auto">
	<div class="mx-4 2xl:mx-0 md:px-24 mb-8">
		<article class="mx-auto">
			<div class="mx-auto prose dark:prose-invert prose-a:text-primary-600 dark:prose-a:text-primary-500 md:prose-lg lg:prose-xl min-h-80">
				<Breadcrumb aria-label="Page path" class="mt-4 not-prose hidden md:flex">
					<BreadcrumbItem href="/" home>Home</BreadcrumbItem>
					<BreadcrumbItem href="/hikes/">Hikes</BreadcrumbItem>
					<BreadcrumbItem>{data.post.title}</BreadcrumbItem>
				</Breadcrumb>
				<Heading tag="h1" class="!mb-0 !mt-2">{data.post.title}</Heading>
				<div class="flex flex-row flex-wrap gap-2 !mt-2 !mb-4">
					<span>{data.post.author}</span>
					·
					<span>{data.post.time}</span>
					·
					<span>{new Date(data.post.date).toLocaleDateString('en-us', { year:"numeric", month:"short", day:"numeric"})}</span>
					{#if data.post.tags?.length}
						·
						<div class="flex flex-row justify-end gap-2" aria-details="tags">
							<span aria-label="tags" class="sr-only"></span>
							{#each data.post.tags as t}
								<span>{t}</span>
							{/each}
						</div>
					{/if}
				</div>
				<div id="content">
					<Card
						horizontal
						img={data.post.image}
						class="not-prose w-full max-w-none bg-transparent dark:bg-transparent border-transparent dark:border-transparent"
						classes={{ image: "md:w-48 lg:w-[24rem] rounded-lg md:rounded-lg" }}
					>
						<div class="mx-4 mt-4 md:mt-0">
							<ul>
								<li><b>Distance</b>: {getDistance(data.map.properties.distance ?? 0)}</li>
								<li><b>Elevation gain/loss</b>: {getDistance(data.map.properties.ascent ?? 0)}/{getDistance(data.map.properties.descent ?? 0)}</li>
								<li><b>Duration</b>: {getTime(data.map.properties.duration ?? 0)}<sup>*</sup></li>
							</ul>
							<span><sup>
								* Pure net walking time with above average speed.
							</sup></span>
							{#if data.display.filePrimary || data.display.fileGpx}
								<blockquote class="!mb-0">
									Grab the
									{#if data.display.fileGpx && data.display.filePrimary}
										<A href={fileGpx.path} download={fileGpx.path.substring(fileGpx.path.lastIndexOf('/') + 1)}>{fileGpx.type}</A>
										or
									{:else if data.display.fileGpx}
										<A href={fileGpx.path} download={fileGpx.path.substring(fileGpx.path.lastIndexOf('/') + 1)}>{fileGpx.type}</A>
									{/if}
									{#if data.display.filePrimary}
										<A href={filePrimary.path} download={filePrimary.path.substring(filePrimary.path.lastIndexOf('/') + 1)}>{filePrimary.type}</A>
									{/if}
									file and embark on your own adventure!
								</blockquote>
							{/if}
						</div>
					</Card>
					<SvelteMarkdown source={data.post.content.slice(0, map2dIndex + 1)} renderers={renderers} />
					<div class="w-full mx-auto not-prose">
						<div id="container-3d" class="w-full aspect-square"></div>
						<Attribution {attrMapbox} {attrOSM} />
						{@render statsSnippet()}
					</div>
					<SvelteMarkdown source={data.post.content.slice(map2dIndex + 1, map3dIndex + 1)} renderers={renderers} />
					<div class="w-full mx-auto not-prose">
						<div class="overflow-hidden aspect-square">
							<div id="container-interactive" class="w-full aspect-square"></div>
						</div>
						{@render statsSnippet()}
					</div>
					<SvelteMarkdown source={data.post.content.slice(map3dIndex + 1)} renderers={renderers} />
				</div>
			</div>
		</article>
	</div>
</div>

<ToTopButton />

<AppFooter />
