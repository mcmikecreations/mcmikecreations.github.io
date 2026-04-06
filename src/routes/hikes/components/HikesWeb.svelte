<script lang="ts">
import AppMeta from '$lib/components/AppMeta.svelte';
import { Heading, Progressbar, Button } from 'flowbite-svelte';
import { onMount } from 'svelte';
import 'leaflet/dist/leaflet.css';
import { getDistance, getTime } from '$lib/hikes/build-statistics';
import type { Layer } from 'leaflet';
import type { Feature, GeoJsonObject, Geometry } from 'geojson';
import HikesTimeline from './HikesTimeline.svelte';
import { secondaryGeometryColor } from '$lib/hikes/build-geometry';
import maps from '$lib/data/hikes.json';
import { type Feature as MapFeature, type GeometryData, getMapFeatures } from '$lib/data/map-info';
import { loadGeometry, loadProperties } from '$lib/hikes/build-geometry';

let data: any = $state(null);
let loadingProgress = $state(0);
let isLoading = $state(true);
let hasStartedLoading = $state(false);

function hash(str: string): number {
    let hash = 0, i, chr;
    if (str.length === 0) return hash;
    for (i = 0; i < str.length; i++) {
        chr = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + chr;
        hash |= 0; // Convert to 32bit integer
    }
    return hash;
}

async function startLoading() {
    hasStartedLoading = true;
    const features: object[] = [];
    const result = {
        features: features,
        totalDistance: 0.0,
        totalTime: 0.0,
        totalHikes: 0,
        totalAscent: 0.0,
        totalDescent: 0.0,
    };

    const mapsToProcess = maps.filter(mapInfo => mapInfo.properties?.hidden !== true);
    const totalMaps = mapsToProcess.length;
    let loadedMaps = 0;

    for (const mapInfo of mapsToProcess) {
        const layer = getMapFeatures(mapInfo as any).find((x: MapFeature) => x.type === 'Geometry') as MapFeature;
        if (!layer) continue;
        const geometryData = layer.data as GeometryData;
        const geometry = await loadGeometry(window.fetch, geometryData);
        const properties = loadProperties(mapInfo as any, geometry);

        if (mapInfo.properties?.draft !== true) {
            result.totalHikes += properties.dates.length;
            result.totalDistance += (properties.distance ?? 0) * properties.dates.length;
            result.totalTime += (properties.duration ?? 0) * properties.dates.length;
            result.totalAscent += (properties.ascent ?? 0) * properties.dates.length;
            result.totalDescent += (properties.descent ?? 0) * properties.dates.length;
        }

        (geometry as any)['properties']['id'] = hash(mapInfo.route);
        (geometry as any)['properties']['route'] = mapInfo.route;
        (geometry as any)['properties'] = Object.assign({}, (geometry as any)['properties'], properties);

        if (mapInfo.properties?.checkpoints) {
            (geometry as any)['geometry'] = {
                "type": "LineString",
                "coordinates": mapInfo.properties?.checkpoints,
            };
            delete (geometry as any)['properties']['extras'];
            delete (geometry as any)['properties']['segments'];
            delete (geometry as any)['properties']['way_points'];
        }

        features.push(geometry);
        loadedMaps++;
        loadingProgress = Math.round((loadedMaps / totalMaps) * 100);
    }
    data = result;

    const { L } = await import('$lib/components/leaflet.almostover.js');
    const map = L.map('map', {
        almostOnMouseMove: false,
        almostDistance: 15,
    } as any).setView([47.694653017305036, 11.799241670256336], 10);

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
            color: secondaryGeometryColor,
            dashArray: feature?.properties?.draft === true ? '5, 5' : undefined,
        };
    }

    const hikesLayer = L.geoJSON(data.features as GeoJsonObject[], {
        style: staticColor,
        onEachFeature: function(feature: Feature<any, any>, layer: Layer) {
            if (feature.properties) {
                const gpxLinks = (feature.properties.dates || [])
                    .filter((x: any) => x.gpx)
                    .map((x: any, i: number) => `<a href="${x.gpx}">GPX${i > 0 ? ` ${i + 1}` : ''}</a>`);
                const gpxSuffix = gpxLinks.length > 0 ? `, ${gpxLinks.join(', ')}` : '';
                layer.bindPopup(
`<ul>
<li>Distance: ${getDistance(feature.properties.distance ?? 0)}</li>
<li>Duration: ${getTime(feature.properties.duration ?? 0)}</li>
<li>Ascent: ${getDistance(feature.properties.ascent ?? 0)}</li>
<li>Descent: ${getDistance(feature.properties.descent ?? 0)}</li>
<li>Dates: ${feature.properties.dates.map((x : any) => {
    const filename = x.path ? x.path.split('/').pop().replace('.md', '') : null;
    const targetRoute = filename ? `/hikes/${filename}/` : feature.properties.route;
    return `<a href="${targetRoute}">${new Date(x.date).toLocaleDateString('en-us', { year:"numeric", month:"short", day:"numeric"})}` + `</a>`;
}).join('; ')}</li>
<li><a href="${feature.properties.route}">Map Link</a>, <a href="${feature.properties.filePath}">${feature.properties.fileType}</a>${gpxSuffix}</li>
</ul>`);
            }
        }
    }).addTo(map);

    (map as any).almostOver.addLayer(hikesLayer);
    map.on('almost:click', function (e: any) {
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
    isLoading = false;
}
</script>

<AppMeta
	title={`Web of Hikes | Collecting All Routes and Peaks"`}
	description={`Visiting all peaks in the biggest possible area while using the same departure and arrival points as other hikes.`}
	type="website"
/>

<Heading tag="h2" class="mb-2">Web of Hikes: Collecting All Routes and Peaks</Heading>
<p class="mb-8 text-gray-600 dark:text-gray-300">
	These posts focus on visiting all
	peaks in the biggest possible area while using the same departure and
	arrival points as other hikes.
</p>

<div class="flex flex-col gap-4 mt-8">
    {#if data}
        <article class="
        w-full max-w-none p-4 bg-gray-50 rounded-lg dark:bg-gray-800 flex flex-col md:flex-row gap-4
        prose dark:prose-invert prose-a:text-primary-600 dark:prose-a:text-primary-500
">
            <div>
                <ul>
                    <li>Total hikes: {data.totalHikes}</li>
                    <li>Total time: {getTime(data.totalTime)}</li>
                    <li>Total distance: {getDistance(data.totalDistance)}</li>
                    <li>Total ascent: {getDistance(data.totalAscent)}</li>
                    <li>Total descent: {getDistance(data.totalDescent)}</li>
                </ul>
            </div>
            <div class="flex-1 w-full min-w-0">
                <!-- Timeline typically takes all hikes, modifying it to take subset might be wanted if props were present -->
                <HikesTimeline />
            </div>
        </article>
    {:else}
        <article class="w-full max-w-none p-4 bg-gray-50 rounded-lg dark:bg-gray-800 flex flex-col items-center justify-center min-h-[250px]">
            {#if !hasStartedLoading}
                <Button onclick={startLoading}>Load Web of Hikes</Button>
                <div class="text-xs text-gray-500 dark:text-gray-400 mt-3 max-w-md text-center">Warning: Loading this visualization will download a large amount of spatial coordinate data (GeoJSON and GPX files).</div>
            {:else}
                <span class="text-gray-500 dark:text-gray-400 mb-4">Processing coordinates... {loadingProgress}%</span>
                <Progressbar progress={loadingProgress} size="h-2" class="w-1/2 md:w-1/3" />
            {/if}
        </article>
    {/if}
    <div class="w-full bg-gray-50 rounded-lg overflow-hidden dark:bg-gray-800 relative z-0 aspect-[4/3] md:aspect-[21/9]">
        {#if isLoading}
            <div class="absolute inset-0 flex flex-col items-center justify-center z-10 gap-4 p-8">
                {#if hasStartedLoading}
                    <span class="text-gray-500 dark:text-gray-400">Loading map elements...</span>
                    <!-- Progress bar removed here as requested -->
                {/if}
            </div>
        {/if}
        <div class="w-full h-full transition-opacity duration-500 {isLoading ? 'opacity-0' : 'opacity-100'}">
            <div id="map" class="w-full h-full relative z-0"></div>
        </div>
    </div>
</div>
