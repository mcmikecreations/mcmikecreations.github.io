<script lang="ts">
	/* eslint-disable @typescript-eslint/ban-ts-comment */
	import type { PageData } from './$types';
	import { Breadcrumb, BreadcrumbItem, Card, Heading, A } from 'flowbite-svelte';
	import {
		ClockOutline,
		MapPinOutline,
		ArrowUpOutline,
		ArrowDownOutline,
		ArrowLeftOutline
	} from 'flowbite-svelte-icons';
	import Markdown from '$lib/renderers/vendor/Markdown.svelte';
	import type { Token, Tokens } from 'marked';
	import DefaultCode from '$lib/renderers/DefaultCode.svelte';
	import DefaultLink from '$lib/renderers/DefaultLink.svelte';
	import ToTopButton from '$lib/components/ToTopButton.svelte';
	import DefaultImage from '$lib/renderers/DefaultImage.svelte';
	import { getDistance, getTime } from '$lib/hikes/build-statistics';
	import type { Feature, TilesData } from '$lib/data/map-info';
	import { providerFolder, providers } from '$lib/data/map-providers';
	import type { GeoJsonObject, Geometry, Feature as F } from 'geojson';
	import {
		secondaryGeometryColor,
		primaryGeometryColor,
		secondaryIndicatorColor
	} from '$lib/hikes/build-geometry';
	import { getNodeIconDetails, formatTags } from '$lib/hikes/map-utils';
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
	let allHikesLink = $derived(data.post.page > 1 ? `/hikes/page/${data.post.page}/#${data.post.anchor}` : `/hikes/#${data.post.anchor}`);
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

	let fullResImageSrc = $state<string | undefined>(undefined);
	let fullImageLoaded = $state(false);

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
				attribution: '<a href="https://www.mapbox.com/about/maps/" target="_blank" title="Mapbox" aria-label="Mapbox">© Mapbox</a> <a href="https://www.openstreetmap.org/about/" target="_blank" title="OpenStreetMap" aria-label="OpenStreetMap">© OpenStreetMap</a> <a class="mapbox-improve-map" href="https://apps.mapbox.com/feedback/?owner=examples&amp;id=cke97f49z5rlg19l310b7uu7j&amp;access_token=pk.eyJ1IjoiZXhhbXBsZXMiLCJhIjoiY203eXd1a3ZzMGV1ejJrcHRvdnVoYng0NCJ9.NzlqpAcLHejzezQqazzI-w#/1/1/1" target="_blank" title="Improve this map" aria-label="Improve this map" rel="noopener nofollow">Improve this map</a>'
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
				color: primaryGeometryColor,
				weight: 4,
				opacity: 1.0
			};
		}
		const staticColorOutline = function(feature : F<Geometry, any> | undefined) {
			return {
				color: '#ffffff',
				weight: 7,
				opacity: 0.9
			};
		}

		const hikesLayerOutline = L.geoJSON(data.mapDisplay.dataGeometry as GeoJsonObject[], {
			style: staticColorOutline,
			interactive: false
		}).addTo(map);

		const hikesLayer = L.geoJSON(data.mapDisplay.dataGeometry as GeoJsonObject[], {
			style: staticColor,
			onEachFeature: function(feature: F<any, any>, layer: Layer) {
			}
		}).addTo(map);
		map.almostOver.addLayer(hikesLayer);

		if (data.map.properties?.nodes) {
			const nodesLayer = L.layerGroup().addTo(map);

			const renderNodes = () => {
				nodesLayer.clearLayers();
				const filteredNodes: any[] = [];
				const minPixelDistance = 24;

				data.map.properties.nodes.forEach((node: any) => {
					const p1 = map.project([node.lat, node.lon], map.getZoom());
					const isOverlapping = filteredNodes.some(n => {
						const p2 = map.project([n.lat, n.lon], map.getZoom());
						return p1.distanceTo(p2) < minPixelDistance;
					});

					if (!isOverlapping) {
						filteredNodes.push(node);
					}
				});

				filteredNodes.forEach(node => {
					const name = node.tags?.name || node.tags?.natural || "POI";
					const ele = node.tags?.ele ? ` (${node.tags.ele}m)` : '';
					const iconDetails = getNodeIconDetails(node.tags || {});

					const icon = L.divIcon({
						html: `<div style="background-color: ${iconDetails.color}; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3); font-size: 13px; line-height: 1;">${iconDetails.emoji}</div>`,
						className: '',
						iconSize: [24, 24],
						iconAnchor: [12, 12],
						popupAnchor: [0, -12]
					});

					let popupContent = `<div style="margin-bottom: 8px;"><b>${name}</b>${ele}</div>`;
					const formattedTags = formatTags(node.tags || {});

					const tagsList = formattedTags
						.map(([k, v]) => `<tr><td style="padding-right: 8px; font-weight: 600; font-size: 11px; color: #6b7280; vertical-align: top; white-space: nowrap;">${k}</td><td style="font-size: 11px; word-break: break-word;">${v}</td></tr>`)
						.join('');

					if (tagsList) {
						popupContent += `<div style="max-height: 150px; overflow-y: auto;"><table style="min-width: 100%; border-spacing: 0;">${tagsList}</table></div>`;
					}

					const marker = L.marker([node.lat, node.lon], { icon })
						.bindPopup(popupContent);
					nodesLayer.addLayer(marker);
				});
			};

			renderNodes();
			map.on('zoomend', renderNodes);
		}

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
		// Delay loading of the full resolution image to allow other assets to finish loading first
		if (data.post.imageFull) {
			window.addEventListener('load', () => {
				setTimeout(() => {
					fullResImageSrc = data.post.imageFull;
				}, 100);
			});
			// Fallback in case window load already fired
			setTimeout(() => {
				if (!fullResImageSrc) {
					fullResImageSrc = data.post.imageFull;
				}
			}, 1000);
		}

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
				<div class="mt-2 flex md:hidden">
					<A href={allHikesLink} class="inline-flex items-center">
						<ArrowLeftOutline class="w-5 h-5 me-2" />
						Back to All Hikes
					</A>
				</div>
				<Breadcrumb aria-label="Page path" class="mt-4 not-prose hidden md:flex">
					<BreadcrumbItem href="/" home>Home</BreadcrumbItem>
					<BreadcrumbItem href={allHikesLink}>Hikes</BreadcrumbItem>
					<BreadcrumbItem>{data.post.title}</BreadcrumbItem>
				</Breadcrumb>
				<Heading tag="h1" class="!mb-0 !mt-2">{data.post.title}</Heading>
				<div class="flex flex-row flex-wrap gap-2 !mt-2 !mb-4">
					<span>{data.post.author}</span>
					·
					<span>{data.post.time}</span>
					·
					<a class="no-underline hover:underline" href="/hikes/year/{new Date(data.post.date).getFullYear()}">{new Date(data.post.date).toLocaleDateString('en-us', { year:"numeric", month:"short", day:"numeric"})}</a>
					{#if data.post.tags?.length}
						·
						<div class="flex flex-row flex-wrap justify-end gap-2 items-center" aria-details="tags">
							<span aria-label="tags" class="sr-only"></span>
							{#each data.post.tags as t}
								<a class="bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-300 px-2.5 py-0.5 rounded no-underline hover:bg-primary-200 dark:hover:bg-primary-800" href="/hikes/tag/{t}">{t}</a>
							{/each}
						</div>
					{/if}
				</div>
				<div id="content">
					<div class="flex flex-col md:flex-row gap-6 mb-6 not-prose w-full max-w-none">
						{#if data.post.imageFull}
							<div class="relative w-full md:w-48 lg:w-[24rem] aspect-video md:aspect-auto m-0 shrink-0 rounded-lg md:rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
								<img src={data.post.image} alt={data.post.title} class="absolute inset-0 w-full h-full object-cover m-0 {fullImageLoaded ? 'opacity-0 delay-500' : 'opacity-100'} transition-opacity duration-1000" />
								{#if fullResImageSrc}
									<picture class="absolute inset-0 w-full h-full m-0">
										<source media="(min-width: 768px)" srcset={fullResImageSrc} />
										<img src={data.post.image} alt={data.post.title} class="w-full h-full object-cover m-0 transition-opacity duration-500 {fullImageLoaded ? 'opacity-100' : 'opacity-0'}" onload={() => fullImageLoaded = true} />
									</picture>
								{/if}
							</div>
						{/if}
						<div class="flex w-full flex-col justify-center">
							<div class="flex flex-row flex-wrap gap-x-4 gap-y-4 md:gap-x-6 md:gap-y-6 my-2">
								<div class="flex items-center gap-3 basis-[140px] grow">
									<div class="text-primary-600 dark:text-primary-500 bg-primary-100 dark:bg-primary-900 rounded-lg p-2 shrink-0">
										<ClockOutline class="w-6 h-6" />
									</div>
									<div>
										<div class="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Duration*</div>
										<div class="font-semibold whitespace-nowrap">{getTime(data.map.properties.duration ?? 0)}</div>
									</div>
								</div>
								<div class="flex items-center gap-3 basis-[140px] grow">
									<div class="text-primary-600 dark:text-primary-500 bg-primary-100 dark:bg-primary-900 rounded-lg p-2 shrink-0">
										<MapPinOutline class="w-6 h-6" />
									</div>
									<div>
										<div class="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Distance</div>
										<div class="font-semibold whitespace-nowrap">{getDistance(data.map.properties.distance ?? 0)}</div>
									</div>
								</div>
								<div class="flex items-center gap-3 basis-[140px] grow">
									<div class="text-primary-600 dark:text-primary-500 bg-primary-100 dark:bg-primary-900 rounded-lg p-2 shrink-0">
										<ArrowUpOutline class="w-6 h-6" />
									</div>
									<div>
										<div class="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Ascent</div>
										<div class="font-semibold whitespace-nowrap">{getDistance(data.map.properties.ascent ?? 0)}</div>
									</div>
								</div>
								<div class="flex items-center gap-3 basis-[140px] grow">
									<div class="text-primary-600 dark:text-primary-500 bg-primary-100 dark:bg-primary-900 rounded-lg p-2 shrink-0">
										<ArrowDownOutline class="w-6 h-6" />
									</div>
									<div>
										<div class="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Descent</div>
										<div class="font-semibold whitespace-nowrap">{getDistance(data.map.properties.descent ?? 0)}</div>
									</div>
								</div>
							</div>
							<div class="text-sm text-gray-500 dark:text-gray-400 mt-2">
								* Duration is pure net walking time in summer with above average speed.
							</div>
							{#if data.display.filePrimary || data.display.fileGpx}
								<blockquote class="!mb-0 mt-4 border-l-4 border-gray-300 dark:border-gray-600 pl-4 py-1 italic text-gray-600 dark:text-gray-400">
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
					</div>
					<Markdown source={data.post.content.slice(0, map2dIndex + 1)} {renderers} />
					<div class="w-full mx-auto not-prose">
						<Map3d parameters={map3dParameters} {contentElement} bind:refresh={myRefresh} bind:updateIndicator={myUpdateIndicator3d} />
						{@render statsSnippet()}
					</div>
					<Markdown source={data.post.content.slice(map2dIndex + 1, map3dIndex + 1)} {renderers} />
					<div class="w-full mx-auto not-prose">
						<div class="overflow-hidden aspect-square">
							<div id="container-interactive" class="w-full aspect-square"></div>
						</div>
						{@render statsSnippet()}
					</div>
					<Markdown source={data.post.content.slice(map3dIndex + 1)} {renderers} />
				</div>
			</div>
		</article>
	</div>
</div>

<ToTopButton />
