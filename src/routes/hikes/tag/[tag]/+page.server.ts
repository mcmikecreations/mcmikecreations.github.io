import { getAllPosts, getPosts } from '$lib/hikes/hikes-info';
import { error } from '@sveltejs/kit';
import hikes from '$lib/data/hikes.json';
import type { Map as HikeMap, GeometryData } from '$lib/data/map-info';
import { getMapFeatures } from '$lib/data/map-info';
import { providerFolder } from '$lib/data/map-providers';
import { mergeMetrics } from '$lib/hikes/hike-metrics';

export const prerender = true;

export function entries() {
    const posts = getAllPosts();
    const tags = [...new Set(posts.flatMap(p => p.tags))];
    return tags.map(tag => ({ tag }));
}

type WeekHike = { name: string; route: string };
export type WeekData = { year: number; weekIndex: number; label: string; hikes: WeekHike[] };
export type WebStats = {
    totalDistance: number;
    totalTime: number;
    totalHikes: number;
    totalAscent: number;
    totalDescent: number;
};
export type HikeStats = { distance: number | null; duration: number | null; ascent: number | null; descent: number | null };
export type WebData = { stats: WebStats; weeks: WeekData[]; hikeStats: Record<string, HikeStats> };

function getYearWeeks(year: number): WeekData[] {
    const weeks: WeekData[] = [];
    for (let i = 0; i < 53; i++) {
        const wStart = new Date(Date.UTC(year, 0, 1 + i * 7));
        const wEnd = new Date(Math.min(Date.UTC(year, 0, 1 + i * 7 + 6), Date.UTC(year, 11, 31)));
        if (wStart.getUTCFullYear() > year) break;
        const startStr = wStart.toISOString().split('T')[0];
        const endStr = wEnd.toISOString().split('T')[0];
        weeks.push({ year, weekIndex: i, label: `${startStr} to ${endStr}`, hikes: [] });
    }
    return weeks;
}

async function fetchGeometry(fetchFn: typeof fetch, layerData: GeometryData): Promise<any> {
    if (!layerData.path) return null;
    const sepIdx = layerData.path.indexOf('#');
    const filePath = layerData.path.slice(0, sepIdx);
    const res = await fetchFn(`/${providerFolder}/${layerData.provider}/${filePath}`);
    const json = await res.json();
    return layerData.path.slice(sepIdx + 2).split('/').reduce((o: any, k: string) => o[k], json);
}

async function computeWebData(fetchFn: typeof fetch): Promise<WebData> {
    const maps = hikes as unknown as HikeMap[];

    // Build timeline weeks
    const yearsData = new Map<number, WeekData[]>();
    for (const hike of maps) {
        if (hike.properties?.draft === true || (hike.properties as any)?.hidden === true) continue;
        for (const dateObj of hike.properties.dates) {
            const dateStr = dateObj.date;
            const year = parseInt(dateStr.substring(0, 4));
            const month = parseInt(dateStr.substring(5, 7)) - 1;
            const day = parseInt(dateStr.substring(8, 10));
            if (!yearsData.has(year)) yearsData.set(year, getYearWeeks(year));
            const d = new Date(Date.UTC(year, month, day));
            const startOfYear = new Date(Date.UTC(year, 0, 1));
            const weekIndex = Math.floor((d.getTime() - startOfYear.getTime()) / (86400000 * 7));
            const filename = dateObj.path ? dateObj.path.split('/').pop()?.replace('.md', '') : null;
            const targetRoute = filename ? `/hikes/${filename}/` : hike.route;
            const weeks = yearsData.get(year)!;
            if (weeks[weekIndex]) {
                weeks[weekIndex].hikes.push({ name: hike.name, route: targetRoute });
            }
        }
    }
    const allWeeks: WeekData[] = [];
    for (const year of [...yearsData.keys()].sort((a, b) => a - b)) {
        allWeeks.push(...yearsData.get(year)!);
    }

    // Compute stats and per-hike properties by fetching geometry files in parallel
    let totalDistance = 0, totalTime = 0, totalHikes = 0, totalAscent = 0, totalDescent = 0;
    const hikeStats: Record<string, { distance: number | null; duration: number | null; ascent: number | null; descent: number | null }> = {};
    await Promise.all(
        maps
            .filter(m => (m.properties as any)?.hidden !== true)
            .map(async (mapInfo) => {
                const layer = getMapFeatures(mapInfo as any).find((x: any) => x.type === 'Geometry');
                if (!layer) return;
                try {
                    const geo = await fetchGeometry(fetchFn, layer.data as GeometryData);
                    if (!geo) return;
                    const p = mapInfo.properties;
                    const { distance, duration, ascent, descent } = mergeMetrics(p, geo.properties);
                    hikeStats[mapInfo.route] = { distance, duration, ascent, descent };
                    if (p.draft !== true) {
                        totalHikes += p.dates.length;
                        totalDistance += (distance ?? 0) * p.dates.length;
                        totalTime += (duration ?? 0) * p.dates.length;
                        totalAscent += (ascent ?? 0) * p.dates.length;
                        totalDescent += (descent ?? 0) * p.dates.length;
                    }
                } catch {
                    // geometry unavailable, skip hike
                }
            })
    );

    return {
        stats: { totalDistance, totalTime, totalHikes, totalAscent, totalDescent },
        weeks: allWeeks,
        hikeStats
    };
}

export async function load({ params, fetch }) {
    const tag = decodeURIComponent(params.tag);
    const { posts, pagination } = getPosts({ page: 1, tag });

    if (posts.length === 0) {
       throw error(404, 'Tag not found or no posts');
    }

    const base = {
        posts,
        pagination,
        tag,
        showPeople: false,
        header: { fixedNavbar: true }
    };

    if (tag === 'Web') {
        const webData = await computeWebData(fetch);
        return { ...base, webData };
    }

    return base;
}