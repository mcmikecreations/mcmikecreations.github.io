<script lang="ts">
	/* eslint-disable @typescript-eslint/ban-ts-comment */
	import type { PageData } from './$types';
	import { Breadcrumb, BreadcrumbItem, Card, Heading, A } from 'flowbite-svelte';
	import SvelteMarkdown from 'svelte-markdown';
	import type { Token, Tokens } from 'marked';
	import DefaultCode from '$lib/renderers/DefaultCode.svelte';
	import DefaultLink from '$lib/renderers/DefaultLink.svelte';
	import ToTopButton from '$lib/components/ToTopButton.svelte';
	import DefaultImage from '$lib/renderers/DefaultImage.svelte';
	import AppFooter from '$lib/components/AppFooter.svelte';
	import { getDistance, getTime } from '$lib/hikes/build-statistics';
	import type { Feature, TilesData } from '$lib/data/map-info';
	import { providerFolder, providers } from '$lib/data/map-providers';
	import type { GeoJsonObject, Geometry, Feature as F } from 'geojson';
	import {
		secondaryGeometryColor,
		secondaryIndicatorColor
	} from '$lib/hikes/build-geometry';
	import type { Layer } from 'leaflet';
	import { onMount } from 'svelte';
	import 'leaflet/dist/leaflet.css';
	import AppMeta from '$lib/components/AppMeta.svelte';
	import resume from '$lib/data/resume.json';
	import Map3d from '$lib/hikes/Map3d.svelte';
	import type { Map3dParameters } from '$lib/hikes/Map3dParameters';

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

	const statsIndicatorVerticalWidth = 1.0;

	const features = data.mapDisplay.features!;
	const attrMapbox = features.some((x: Feature) => x.type === 'Tiles' && (x.data as TilesData)!.provider!.includes('mapbox'));
	const attrOSM = features.some((x: Feature) => x.type === 'Tiles' && (x.data as TilesData)!.provider!.includes('osm'));

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
		}).setView([data.mapDisplay.origin.lat, data.mapDisplay.origin.lon], 12);
		function refocus() {
			const tempInputs = controlsContainer?.getElementsByTagName('input');
			if (tempInputs) {
				for (let i = 0; i < tempInputs.length; ++i) {
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

		if (statsIndicatorInteractive) {
			const element = statsIndicatorInteractive.getElement();
			if (element) {
				element.classList.remove('hidden');
				statsIndicatorInteractive.setLatLng([y, x]);
			}
		}

		if (myUpdateIndicator3d) {
			const scale = data.mapDisplay.tileScale;
			myUpdateIndicator3d(projected[0] - scale * 0.5, -projected[1] + scale * 0.5, z * data.mapDisplay.pixelsPerMeter);
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

	onMount(async () => {
		await attachInteractive();
		initStatistics();
	});

	const map3dParameters : Map3dParameters = {
		attrMapbox,
		attrOSM,
		origin: data.mapDisplay.origin,
		projection: data.mapDisplay.projection,
		map: data.map,
		tileScale: data.mapDisplay.tileScale,
		pixelsPerMeter: data.mapDisplay.pixelsPerMeter,
		data3d: data.mapDisplay.data3d,
	};
</script>

<AppMeta
	title={data.post.title + ' | Hike'}
	description={data.post.description ?? undefined}
	image={data.post.image}
	type="article"
	tags={data.post.tags}
	article-published_time="{data.post.date}T16:00:00+00:00"
	article-author={resume.basics.name}
	article-section="Hikes"
/>
<svelte:head>
	<link rel="alternate" type="application/rss+xml" title="Mykola's Hiking Blog RSS Feed" href="/hikes/feed.xml" />
	<link rel="alternate" type="application/atom+xml" title="Mykola's Hiking Blog Atom Feed" href="/hikes/atom.xml" />
</svelte:head>

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
							<span>
<!--								<sup>-->
								* Pure net walking time in summer with above average speed.
<!--								</sup>-->
							</span>
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
						<Map3d parameters={map3dParameters} {contentElement} bind:refresh={myRefresh} bind:updateIndicator={myUpdateIndicator3d} />
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
