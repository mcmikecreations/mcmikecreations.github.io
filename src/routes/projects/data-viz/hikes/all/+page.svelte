<script lang="ts">
	/* eslint-disable @typescript-eslint/no-explicit-any */
	import type { PageData } from './$types';
	import AppTitle from '$lib/components/AppTitle.svelte';
	import { Breadcrumb, BreadcrumbItem } from 'flowbite-svelte';
	import {onMount} from 'svelte';
	import 'leaflet/dist/leaflet.css';
	import { getDistance, getTime } from '../[slug]/build-statistics';
	import type { Layer } from 'leaflet';
	import type { Feature, GeoJsonObject, Geometry } from 'geojson';
	import Timeline from './Timeline.svelte';

	export let data: PageData;

	onMount(async () => {
		const { L } = await import('$lib/components/leaflet.almostover.js');
		const map = L.map('map', {
			almostOnMouseMove: false,
			almostDistance: 15,
		}).setView([47.694653017305036, 11.799241670256336], 10);

		const isStatic = {
			isStatic: true,
			toggle: function() { this.isStatic = !this.isStatic; return this.isStatic; }
		}

		L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
			maxZoom: 19,
			attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
		}).addTo(map);
		const randomColor = function(feature : Feature<Geometry, any> | undefined) {
			return {
				color: '#' + ((feature?.properties?.id ?? 0) & 0x00FFFFFF).toString(16).padStart(6, '0'),
				dashArray: feature?.properties?.draft === true ? '5, 5' : undefined,
			}
		};
		const staticColor = function(feature : Feature<Geometry, any> | undefined) {
			return {
				color: '#000',
				dashArray: feature?.properties?.draft === true ? '5, 5' : undefined,
			};
		}

		const hikesLayer = L.geoJSON(data.features as GeoJsonObject[], {
			style: staticColor,
			onEachFeature: function(feature: Feature<any, any>, layer: Layer) {
				if (feature.properties) {
					layer.bindPopup(
`<ul>
	<li>Distance: ${getDistance(feature.properties.distance ?? 0)}</li>
  <li>Duration: ${getTime(feature.properties.duration ?? 0)}</li>
  <li>Ascent: ${getDistance(feature.properties.ascent ?? 0)}</li>
  <li>Descent: ${getDistance(feature.properties.descent ?? 0)}</li>
  <li>Dates: ${feature.properties.dates.map((x : string) => new Date(x).toLocaleDateString('en-us', { year:"numeric", month:"short", day:"numeric"})).join('; ')}</li>
  <li><a href="${feature.properties.route}">Link</a>, <a href="${feature.properties.filePath}">${feature.properties.fileType}</a></li>
</ul>`);
				}
			}
		}).addTo(map);

		map.almostOver.addLayer(hikesLayer);
		map.on('almost:click', function (e) {
			// noinspection JSDeprecatedSymbols
			const layer = e.layer as Layer;
			layer.openPopup(e.latlng);
		});

		const info = new L.Control({position: 'topright'});

		info.onAdd = function () {
			const divElement = L.DomUtil.create('div', 'leaflet-control-zoom leaflet-bar');

			const anchorElement = L.DomUtil.create('a', 'text-[22px]', divElement);
			anchorElement.href = '#';
			anchorElement.title = 'Toggle colors';
			anchorElement.role = 'button';
			anchorElement.ariaLabel = anchorElement.title;
			anchorElement.ariaDisabled = 'false';
			anchorElement.onclick = () => {
				hikesLayer.setStyle(isStatic.toggle() ? staticColor : randomColor);
				return false;
			}

			const iconElement = L.DomUtil.create('span', '', anchorElement);
			iconElement.ariaHidden = 'true';
			iconElement.innerHTML = '🎨';

			return divElement;
		};

		info.addTo(map);
	});
</script>

<AppTitle title="All hikes" />

<main class="md:px-24 mx-4 2xl:mx-0">
	<Breadcrumb class="mb-4" aria-label="Route" solid>
		<BreadcrumbItem href="/" home>Home</BreadcrumbItem>
		<BreadcrumbItem href="/projects">Projects</BreadcrumbItem>
		<BreadcrumbItem href="/projects/data-viz">Data Viz</BreadcrumbItem>
		<BreadcrumbItem>All</BreadcrumbItem>
	</Breadcrumb>
	<div class="flex flex-row flex-wrap gap-4">
		<article class="flex-1 w-full p-4 bg-gray-50 rounded-lg dark:bg-gray-800 min-w-40">
			<div class="flex flex-row sm:flex-col flex-wrap gap-4 prose dark:prose-invert prose-a:text-primary-600 dark:prose-a:text-primary-500">
				<div class="w-full">
					<ul>
						<li>Total hikes: {data.totalHikes}</li>
						<li>Total time: {getTime(data.totalTime)}</li>
						<li>Total distance: {getDistance(data.totalDistance)}</li>
						<li>Total ascent: {getDistance(data.totalAscent)}</li>
						<li>Total descent: {getDistance(data.totalDescent)}</li>
					</ul>
				</div>
				<Timeline />
			</div>
		</article>
		<div class="flex-[2] bg-gray-50 rounded-lg overflow-hidden dark:bg-gray-800 min-w-80">
			<div id="map" class="w-full aspect-square"></div>
		</div>
	</div>
</main>
