<script lang="ts">
import { Heading, Progressbar, Button } from 'flowbite-svelte';
import { ClockOutline, MapPinOutline, ArrowUpOutline, ArrowDownOutline, TrackingOutline } from 'flowbite-svelte-icons';
import 'leaflet/dist/leaflet.css';
import { getDistance, getTime } from '$lib/hikes/build-statistics';
import type { Layer } from 'leaflet';
import type { Feature, GeoJsonObject, Geometry } from 'geojson';
import HikesTimeline from './HikesTimeline.svelte';
import { primaryGeometryColor } from '$lib/hikes/build-geometry';
import { type MapDate } from '$lib/data/map-info';
import { getNodeIconDetails, formatTags } from '$lib/hikes/map-utils';

type WeekHike = { name: string; route: string };
type WeekData = { year: number; weekIndex: number; label: string; hikes: WeekHike[] };
type WebStats = {
	totalDistance: number;
	totalTime: number;
	totalHikes: number;
	totalAscent: number;
	totalDescent: number;
};
type HikeStats = { distance: number | null; duration: number | null; ascent: number | null; descent: number | null };

interface Props {
	webData: { stats: WebStats; weeks: WeekData[]; hikeStats: Record<string, HikeStats> };
}

let { webData }: Props = $props();

let loadingProgress = $state(0);
let isLoading = $state(true);
let hasStartedLoading = $state(false);

/// blended Catmull-Rom cubic spline
function smoothCoords(pts: number[][], pointsPerSegment = 10, smoothing = 0.5): number[][] {
    if (pts.length < 2) return pts;
    const result: number[][] = [];

    for (let i = 0; i < pts.length - 1; i++) {
        let p0 = i === 0 ? pts[i] : pts[i - 1];
        let p1 = pts[i];
        let p2 = pts[i + 1];
        let p3 = i + 2 < pts.length ? pts[i + 2] : p2;

        let m1_c = (p2[0] - p0[0]) / 2;
        let m1_cy = (p2[1] - p0[1]) / 2;
        let m2_c = (p3[0] - p1[0]) / 2;
        let m2_cy = (p3[1] - p1[1]) / 2;

        if (i === 0) {
            m1_c = p2[0] - p1[0];
            m1_cy = p2[1] - p1[1];
        }
        if (i === pts.length - 2) {
            m2_c = p2[0] - p1[0];
            m2_cy = p2[1] - p1[1];
        }

        let m1_l = p2[0] - p1[0];
        let m1_ly = p2[1] - p1[1];
        let m2_l = p2[0] - p1[0];
        let m2_ly = p2[1] - p1[1];

        let m1_x = m1_l * (1 - smoothing) + m1_c * smoothing;
        let m1_y = m1_ly * (1 - smoothing) + m1_cy * smoothing;
        let m2_x = m2_l * (1 - smoothing) + m2_c * smoothing;
        let m2_y = m2_ly * (1 - smoothing) + m2_cy * smoothing;

        for (let j = 0; j < pointsPerSegment; j++) {
            let t = j / pointsPerSegment;
            let t2 = t * t;
            let t3 = t2 * t;

            let h00 = 2 * t3 - 3 * t2 + 1;
            let h10 = t3 - 2 * t2 + t;
            let h01 = -2 * t3 + 3 * t2;
            let h11 = t3 - t2;

            let x = h00 * p1[0] + h10 * m1_x + h01 * p2[0] + h11 * m2_x;
            let y = h00 * p1[1] + h10 * m1_y + h01 * p2[1] + h11 * m2_y;

            result.push([x, y]);
        }
    }

    result.push(pts[pts.length - 1]);

    return result;
}

function hash(str: string): number {
    let hash = 0, i, chr;
    if (str.length === 0) return hash;
    for (i = 0; i < str.length; i++) {
        chr = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + chr;
        hash |= 0;
    }
    return hash;
}

async function startLoading() {
    hasStartedLoading = true;
    const { default: maps } = await import('$lib/data/hikes.json');

    const features: object[] = [];
    const mapsToProcess = (maps as any[]).filter(mapInfo => mapInfo.properties?.hidden !== true);
    const totalMaps = mapsToProcess.length;

    for (let i = 0; i < mapsToProcess.length; i++) {
        const mapInfo = mapsToProcess[i];
        const { checkpoints, ...props } = mapInfo.properties as any;
        if (!checkpoints) continue;

        const hikeProps = webData.hikeStats[mapInfo.route];
        const sharedProperties = {
            ...props,
            id: hash(mapInfo.route),
            route: mapInfo.route,
            distance: hikeProps?.distance ?? null,
            duration: hikeProps?.duration ?? null,
            ascent: hikeProps?.ascent ?? null,
            descent: hikeProps?.descent ?? null,
        };
        const smoothed = smoothCoords(checkpoints, 10, 0.4);

        features.push({
            type: 'Feature',
            geometry: { type: 'LineString', coordinates: smoothed },
            properties: { ...sharedProperties, isSmoothedOutline: true, isSmoothed: false },
        });
        features.push({
            type: 'Feature',
            geometry: { type: 'LineString', coordinates: smoothed },
            properties: { ...sharedProperties, isSmoothed: true },
        });

        loadingProgress = Math.round(((i + 1) / totalMaps) * 100);
    }

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

    const randomColor = function(feature: Feature<Geometry, any> | undefined) {
        if (feature?.properties?.isSmoothedOutline) {
            return {
                color: '#ffffff',
                weight: 7,
                opacity: 0.9,
                dashArray: feature?.properties?.draft === true ? '5, 5' : undefined,
            };
        }
        const c = '#' + ((feature?.properties?.id ?? 0) & 0x00FFFFFF).toString(16).padStart(6, '0');
        if (feature?.properties?.isSmoothed) {
            return {
                color: c,
                weight: 4,
                opacity: 1.0,
                dashArray: feature?.properties?.draft === true ? '5, 5' : undefined,
            };
        }
        return {
            color: c,
            dashArray: feature?.properties?.draft === true ? '5, 5' : undefined,
        }
    };
    const staticColor = function(feature: Feature<Geometry, any> | undefined) {
        if (feature?.properties?.isSmoothedOutline) {
            return {
                color: '#ffffff',
                weight: 7,
                opacity: 0.9,
                dashArray: feature?.properties?.draft === true ? '5, 5' : undefined,
            };
        }
        if (feature?.properties?.isSmoothed) {
            return {
                color: primaryGeometryColor,
                weight: 4,
                opacity: 1.0,
                dashArray: feature?.properties?.draft === true ? '5, 5' : undefined,
            };
        }
        return {
            color: primaryGeometryColor,
            weight: 3,
            opacity: 0.8,
            dashArray: feature?.properties?.draft === true ? '5, 5' : undefined,
        };
    }

    const hikesLayer = L.geoJSON(features as GeoJsonObject[], {
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
<li>Posts: ${feature.properties.dates.map((x: MapDate) => {
    const filename = x.path ? x.path!.split('/').pop()!.replace('.md', '') : null;
    const targetRoute = filename ? `/hikes/${filename}/` : feature.properties.route;
    return `<a href="${targetRoute}">${new Date(x.date).toLocaleDateString('en-us', { year:"numeric", month:"short", day:"numeric"})}` + `</a>`;
}).join('; ')}</li>
<li>${feature.properties.dates.map((x: MapDate) => !!x.path).includes(true) ? '' : `<a href="${feature.properties.route}">Map Link</a>, `}
<a href="${feature.properties.filePath}">${feature.properties.fileType}</a>${gpxSuffix}
</li>
</ul>`);
            }
        }
    }).addTo(map);

    let nodesData: any[] = [];
    (maps as any[]).forEach(m => {
        if (m.properties?.hidden !== true && m.properties?.nodes) {
            m.properties.nodes.forEach((node: any) => {
                nodesData.push(node);
            });
        }
    });

    const uniqueNodes = Array.from(new Map(nodesData.map(node => [node.id, node])).values());
    const nodesLayer = L.layerGroup().addTo(map);

    const renderNodes = () => {
        nodesLayer.clearLayers();
        const filteredNodes: any[] = [];
        const minPixelDistance = 24;

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


<Heading tag="h2" class="mb-2">Web of Hikes: Collecting All Routes and Peaks</Heading>
<p class="mb-8 text-gray-600 dark:text-gray-300">
	These posts focus on visiting all
	peaks in the biggest possible area while using the same departure and
	arrival points as other hikes.
</p>

<div class="flex flex-col gap-4 mt-8">
    <article class="
        w-full max-w-none p-4 md:p-6 bg-gray-50 rounded-lg dark:bg-gray-800 flex flex-col gap-6
        prose dark:prose-invert prose-a:text-primary-600 dark:prose-a:text-primary-500
    ">
        <div class="flex flex-row flex-wrap gap-x-4 gap-y-4 md:gap-x-6 md:gap-y-6 not-prose w-full">
            <div class="flex items-center gap-3 basis-[140px] grow">
                <div class="text-primary-600 dark:text-primary-500 bg-primary-100 dark:bg-primary-900 rounded-lg p-2 shrink-0">
                    <TrackingOutline class="w-5 h-5 md:w-6 md:h-6" />
                </div>
                <div class="min-w-0">
                    <div class="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide truncate">Total Hikes</div>
                    <div class="font-semibold whitespace-nowrap">{webData.stats.totalHikes}</div>
                </div>
            </div>
            <div class="flex items-center gap-3 basis-[140px] grow">
                <div class="text-primary-600 dark:text-primary-500 bg-primary-100 dark:bg-primary-900 rounded-lg p-2 shrink-0">
                    <ClockOutline class="w-5 h-5 md:w-6 md:h-6" />
                </div>
                <div class="min-w-0">
                    <div class="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide truncate">Total Time</div>
                    <div class="font-semibold whitespace-nowrap">{getTime(webData.stats.totalTime)}</div>
                </div>
            </div>
            <div class="flex items-center gap-3 basis-[140px] grow">
                <div class="text-primary-600 dark:text-primary-500 bg-primary-100 dark:bg-primary-900 rounded-lg p-2 shrink-0">
                    <MapPinOutline class="w-5 h-5 md:w-6 md:h-6" />
                </div>
                <div class="min-w-0">
                    <div class="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide truncate">Distance</div>
                    <div class="font-semibold whitespace-nowrap">{getDistance(webData.stats.totalDistance)}</div>
                </div>
            </div>
            <div class="flex items-center gap-3 basis-[140px] grow">
                <div class="text-primary-600 dark:text-primary-500 bg-primary-100 dark:bg-primary-900 rounded-lg p-2 shrink-0">
                    <ArrowUpOutline class="w-5 h-5 md:w-6 md:h-6" />
                </div>
                <div class="min-w-0">
                    <div class="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide truncate">Ascent</div>
                    <div class="font-semibold whitespace-nowrap">{getDistance(webData.stats.totalAscent)}</div>
                </div>
            </div>
            <div class="flex items-center gap-3 basis-[140px] grow">
                <div class="text-primary-600 dark:text-primary-500 bg-primary-100 dark:bg-primary-900 rounded-lg p-2 shrink-0">
                    <ArrowDownOutline class="w-5 h-5 md:w-6 md:h-6" />
                </div>
                <div class="min-w-0">
                    <div class="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide truncate">Descent</div>
                    <div class="font-semibold whitespace-nowrap">{getDistance(webData.stats.totalDescent)}</div>
                </div>
            </div>
        </div>
        <div class="w-full min-w-0">
            <HikesTimeline weeks={webData.weeks} />
        </div>
    </article>
    <div class="w-full bg-gray-50 rounded-lg overflow-hidden dark:bg-gray-800 relative z-0 aspect-[4/3] md:aspect-[21/9]">
        {#if !hasStartedLoading}
            <div class="absolute inset-0 flex flex-col items-center justify-center z-10 gap-3 p-8">
                <Button onclick={startLoading}>Load Web of Hikes</Button>
                <div class="text-xs text-gray-500 dark:text-gray-400 max-w-md text-center">Warning: Loading this visualization will download a large amount of spatial coordinate data (GeoJSON and GPX files).</div>
            </div>
        {:else if isLoading}
            <div class="absolute inset-0 flex flex-col items-center justify-center z-10 gap-4 p-8">
                <span class="text-gray-500 dark:text-gray-400">Processing coordinates... {loadingProgress}%</span>
                <Progressbar progress={loadingProgress} size="h-2" class="w-1/2 md:w-1/3" />
            </div>
        {/if}
        <div class="w-full h-full transition-opacity duration-500 {isLoading ? 'opacity-0' : 'opacity-100'}">
            <div id="map" class="w-full h-full relative z-0"></div>
        </div>
    </div>
</div>