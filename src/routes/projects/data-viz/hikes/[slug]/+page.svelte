<script lang="ts">
	/* eslint-disable @typescript-eslint/ban-ts-comment */
	/* eslint-disable svelte/no-at-html-tags */
	import type { PageData } from './$types';
	import AppMeta from '$lib/components/AppMeta.svelte';
	import AppBreadcrumbs from '$lib/components/AppBreadcrumbs.svelte';
	import AppJsonLd from '$lib/components/AppJsonLd.svelte';
	import { Tabs, TabItem, Img, Breadcrumb, BreadcrumbItem } from 'flowbite-svelte';
	import Markdown from '$lib/renderers/vendor/Markdown.svelte';
	import DefaultLink from '$lib/renderers/DefaultLink.svelte';
	import DefaultImage from '$lib/renderers/DefaultImage.svelte';
	import Map3d from '$lib/hikes/Map3d.svelte';
	import type { Map3dParameters } from '$lib/hikes/Map3dParameters';
	import { getMapFeatures, type Feature, type TilesData } from '$lib/data/map-info';
	import { providerFolder, providers } from '$lib/data/map-providers';
	import type { GeoJsonObject, Geometry, Feature as F } from 'geojson';
	import { secondaryGeometryColor, secondaryIndicatorColor } from '$lib/hikes/build-geometry';
	import type { Layer } from 'leaflet';
	import { onMount } from 'svelte';
	import Attribution from '$lib/hikes/Attribution.svelte';
	import 'leaflet/dist/leaflet.css';
	import { getDistance, getTime } from '$lib/hikes/build-statistics';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();

	const statsIndicatorVerticalWidth = 1.0;

	const features = $derived(getMapFeatures(data.map) as Feature[]);
	const attrMapbox = $derived(features.some((x) => x.type === 'Tiles' && (x.data as TilesData)!.provider!.includes('mapbox')));
	const attrOSM = $derived(features.some((x) => x.type === 'Tiles' && (x.data as TilesData)!.provider!.includes('osm')));

	let statsIndicatorInteractive : any;
	let lastStatsIndicatorTarget : HTMLElement | undefined = $state();
	let contentElement : HTMLElement | undefined = $state();
	let myRefresh: (() => Promise<void>) | undefined = $state();
	let myUpdateIndicator3d: ((x: number, y: number, z: number) => void) | undefined = $state();

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
		} as any).setView([data.origin.lat, data.origin.lon], 13);
		function refocus() {
			const tempInputs = controlsContainer?.getElementsByTagName('input');
			for (let i = 0; i < (tempInputs?.length ?? 0); ++i) {
				if (tempInputs && tempInputs[i]) {
					tempInputs[i].disabled = false;
				}
			}
			map.setZoom(13);
		}
		const controls = L.control.layers(baseMaps).addTo(map);
		const controlsContainer = controls.getContainer();
		if (controlsContainer) {

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
		const hikesLayer = L.geoJSON(data.dataGeometry as GeoJsonObject[], {
			style: staticColor,
			onEachFeature: function(feature: F<any, any>, layer: Layer) {
			}
		}).addTo(map);
		(map as any).almostOver.addLayer(hikesLayer);

		statsIndicatorInteractive = new L.CircleMarker([data.origin.lat, data.origin.lon], {
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

	function onUpdateStatistics(target : HTMLElement | undefined) : void {
		if (!target) {
			return;
		}

		lastStatsIndicatorTarget = target;
		const statsIndicator = document.getElementById('statsIndicator') as (SVGCircleElement | null);
		const statsIndicatorVertical = document.getElementById('statsIndicatorVertical') as (SVGLineElement | null);
		const x = parseFloat(target.getAttribute('data-x') ?? '0');
		const y = parseFloat(target.getAttribute('data-y') ?? '0');
		const z = parseFloat(target.getAttribute('data-z') ?? '0');
		const dz = parseFloat(target.getAttribute('data-dz') ?? '');
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
			statsHeightIndicator.innerHTML = `${(Number.isNaN(dz) ? z : dz).toFixed(1)} m`;

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

		if (statsIndicatorInteractive) {
			const element = statsIndicatorInteractive.getElement();
			if (element) {
				element.classList.remove('hidden');
				statsIndicatorInteractive.setLatLng([y, x]);
			}
		}

		if (myUpdateIndicator3d) {
			const scale = data.tileScale;
			myUpdateIndicator3d(projected[0] - scale * 0.5, -projected[1] + scale * 0.5, z * data.pixelsPerMeter);
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

	onMount(async () => {
		//await attachInteractive();
		initStatistics();
	});

	const map3dParameters : Map3dParameters = $derived({
		attrMapbox,
		attrOSM,
		origin: data.origin,
		projection: data.projection,
		map: data.map,
		tileScale: data.tileScale,
		pixelsPerMeter: data.pixelsPerMeter,
		data3d: data.data3d,
	});
</script>

<AppMeta title={data.map.name} description={data.map.description} image={data.map.image} type="website" />
<AppBreadcrumbs items={[{ name: 'Home', href: '/' }, { name: 'Projects', href: '/projects/' }, { name: 'Data Viz', href: '/projects/data-viz/' }, { name: data.map.name, href: data.map.route }]} />
<AppJsonLd variant="creative-work" name={data.map.name} description={data.map.description} image={data.map.image} url={data.map.route} />

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
						<circle id="statsIndicator" r={data.map.height * 0.125 * 0.5} fill={secondaryIndicatorColor} class="hidden" />
					</svg>
				</div>
			{/if}
		</article>
		<div class="flex-[2] min-w-80">
			<Tabs>
				<TabItem open title="3D" onclick={() => { setTimeout(async () => { if (myRefresh) { await myRefresh(); } }); }}>
					<div id="content" bind:this={contentElement} class="w-full h-auto">
						<Map3d parameters={map3dParameters} {contentElement} bind:refresh={myRefresh} bind:updateIndicator={myUpdateIndicator3d} />
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
						<Markdown source={postItem.post} renderers={{ link: DefaultLink, image: DefaultImage }} />
					</article>
				{/each}
			</div>
		{/if}
	</div>
</main>
