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

    let nodesData: any[] = [];
    maps.forEach(m => {
        if (m.properties?.hidden !== true && m.properties?.nodes) {
            m.properties.nodes.forEach((node: any) => {
                nodesData.push(node);
            });
        }
    });

    const uniqueNodes = Array.from(new Map(nodesData.map(node => [node.id, node])).values());
    const nodesLayer = L.layerGroup().addTo(map);

    const getNodeIconDetails = (tags: any) => {
        if (tags.natural === 'peak') return { emoji: '⛰️', color: '#6b7280' };
        if (tags.natural === 'saddle') return { emoji: '〰️', color: '#16a34a' };
        if (tags.tourism === 'alpine_hut' || tags.tourism === 'wilderness_hut' || tags.building === 'hut') return { emoji: '🛖', color: '#b45309' };
        if (tags.amenity === 'restaurant' || tags.amenity === 'cafe' || tags.amenity === 'fast_food' || tags.amenity === 'pub') return { emoji: '🍽️', color: '#ea580c' };
        if (tags.tourism === 'viewpoint') return { emoji: '🔭', color: '#0284c7' };
        if (tags.waterway === 'waterfall') return { emoji: '🌊', color: '#0ea5e9' };
        if (tags.natural === 'water' || tags.natural === 'spring') return { emoji: '💧', color: '#38bdf8' };
        if (tags.historic === 'ruins' || tags.historic === 'castle') return { emoji: '🏰', color: '#525252' };
        if (tags.highway === 'bus_stop') return { emoji: '🚌', color: '#2563eb' };
        if (tags.railway === 'station' || tags.railway === 'halt' || tags.public_transport === 'station') return { emoji: '🚉', color: '#dc2626' };
        if (tags.tourism === 'information') return { emoji: 'ℹ️', color: '#2563eb' };
        if (tags.place === 'village' || tags.place === 'town' || tags.place === 'city') return { emoji: '🏘️', color: '#7c3aed' };
        if (tags.aeroway === 'aerodrome') return { emoji: '✈️', color: '#6294ff' };
        return { emoji: '📍', color: '#3b82f6' };
    };

    const formatTags = (tags: any): [string, string][] => {
        const formatted = new Map<string, string>();
        const handledKeys = new Set(['name', 'ele']);

        const addHandled = (keys: string[], label: string, formatter: (v: string) => string) => {
            keys.forEach(k => handledKeys.add(k));
            for (const k of keys) {
                if (tags[k] !== undefined && tags[k] !== null) {
                    formatted.set(label, formatter(String(tags[k])));
                    return;
                }
            }
        };

        addHandled(['contact:phone', 'phone', 'contact:mobile', 'mobile'], 'Phone', v => `<a href="tel:${v}" style="color: #2563eb; text-decoration: none;">${v}</a>`);
        addHandled(['contact:website', 'website', 'url'], 'Website', v => `<a href="${v.startsWith('http') ? v : 'https://' + v}" target="_blank" rel="noopener noreferrer" style="color: #2563eb; text-decoration: none;">Link</a>`);
        addHandled(['contact:email', 'email'], 'Email', v => `<a href="mailto:${v}" style="color: #2563eb; text-decoration: none;">${v}</a>`);

        handledKeys.add('wikipedia');
        if (tags.wikipedia) {
            const parts = String(tags.wikipedia).split(':');
            const lang = parts.length > 1 ? parts[0] : 'en';
            const title = parts.length > 1 ? parts[1] : parts[0];
            formatted.set('Wikipedia', `<a href="https://${lang}.wikipedia.org/wiki/${encodeURIComponent(title)}" target="_blank" rel="noopener noreferrer" style="color: #2563eb; text-decoration: none;">${tags.wikipedia}</a>`);
        }

        handledKeys.add('wikidata');
        if (tags.wikidata) {
            formatted.set('Wikidata', `<a href="https://www.wikidata.org/wiki/${tags.wikidata}" target="_blank" rel="noopener noreferrer" style="color: #2563eb; text-decoration: none;">${tags.wikidata}</a>`);
        }

        for (const [k, v] of Object.entries(tags)) {
            if (!handledKeys.has(k)) {
                const prettyKey = k.replace(/[:_]/g, ' ')
                                   .split(' ')
                                   .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                                   .join(' ');
                formatted.set(prettyKey, String(v));
            }
        }

        return Array.from(formatted.entries());
    };

    const renderNodes = () => {
        nodesLayer.clearLayers();
        const filteredNodes: any[] = [];
        const minPixelDistance = 24; // marker diameter is size 24px

        uniqueNodes.forEach(node => {
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
