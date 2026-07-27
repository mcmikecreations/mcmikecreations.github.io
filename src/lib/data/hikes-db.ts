/**
 * The hike database: `hikes.json` — which now holds only routes, dates and
 * fallback metrics — recombined with the per-slug `<slug>.hike.json` sidecars
 * that carry the hand-authored map fields (`name`, `description`, `image`,
 * `origin`, `height`, `checkpoints`, `nodes`).
 *
 * The sidecars live next to the hike markdown under `static/` and are inlined
 * at build time, so this module stays safe in the client bundle.
 */

import rawRoutes from './hikes.json';
import type { HikeMeta, Map, MapDate, MapProperties } from './map-info';

/** `hikes.json` carries no sidecar fields, so it is not a `Map` on its own. */
const routes = rawRoutes as unknown as Array<{ route: string; properties: MapProperties }>;

/** Sidecars sit beside the markdown, and are referenced by served path. */
const metaFolder = '/_projects/data-viz/hikes/markdown';

const sidecars = import.meta.glob('/static/_projects/data-viz/hikes/markdown/*.hike.json', {
	eager: true,
	import: 'default'
}) as Record<string, HikeMeta>;

/** Route slug, e.g. `/projects/data-viz/hikes/seekarkreuz` -> `seekarkreuz`. */
export function hikeSlug(route: string): string {
	return route.substring(route.lastIndexOf('/') + 1);
}

/** Where a route's sidecar lives unless something says otherwise. */
export function defaultMetaPath(slug: string): string {
	return `${metaFolder}/${slug}.hike.json`;
}

/**
 * The sidecar at a served path such as
 * `/_projects/data-viz/hikes/markdown/laubeneck.hike.json`, or undefined if no
 * such file was globbed.
 */
export function getHikeMeta(metaPath: string): HikeMeta | undefined {
	return sidecars[`/static${metaPath}`];
}

/**
 * Fold a sidecar into a hike, in the key order `hikes.json` used to have.
 *
 * The sidecar owns its seven fields outright: swapping one in replaces them all,
 * including dropping `nodes` again if the new sidecar declares none.
 */
export function withHikeMeta(hike: Map, meta: HikeMeta): Map {
	const properties: MapProperties = { ...hike.properties, checkpoints: meta.checkpoints };
	if (meta.nodes === undefined) delete properties.nodes;
	else properties.nodes = meta.nodes;

	return {
		name: meta.name,
		image: meta.image,
		properties,
		description: meta.description,
		route: hike.route,
		height: meta.height,
		standardFeatures: { origin: meta.origin }
	};
}

/** The four metrics a date may pin for itself, overriding the hike's. */
const DATE_METRICS = ['distance', 'duration', 'ascent', 'descent'] as const;

/**
 * Promote a date's own `filePath` / metric overrides into a hike's properties.
 *
 * Returns `properties` unchanged (same reference) when the date overrides
 * nothing, which is the case for every date today.
 */
export function applyDateOverrides(properties: MapProperties, date: MapDate): MapProperties {
	let out: MapProperties | null = null;
	const claim = () => (out ??= { ...properties });

	if (date.filePath) claim().filePath = date.filePath;
	for (const key of DATE_METRICS) {
		if (date[key] != null) claim()[key] = date[key];
	}

	return out ?? properties;
}

/**
 * The hike as one of its dates sees it: the date's `metaPath` sidecar swapped in
 * and its `filePath` / metric overrides promoted.
 *
 * This covers overrides written in `hikes.json` only. A post's front matter can
 * override the same fields, but reading it needs the markdown, so that path runs
 * server-side in `hikes/[slug]/+page.server.ts`.
 */
export function resolveHikeForDate(hike: Map, date: MapDate): Map {
	let base = hike;

	if (date.metaPath) {
		const meta = getHikeMeta(date.metaPath);
		if (!meta) {
			throw new Error(
				`Unknown sidecar "${date.metaPath}" on date ${date.date} of hike route "${hike.route}"`
			);
		}
		base = withHikeMeta(base, meta);
	}

	const properties = applyDateOverrides(base.properties, date);
	return properties === base.properties ? base : { ...base, properties };
}

/** Every hike, in `hikes.json` order, with its sidecar folded back in. */
export const hikes: Map[] = routes.map((entry) => {
	const metaPath = entry.properties.metaPath ?? defaultMetaPath(hikeSlug(entry.route));
	const meta = getHikeMeta(metaPath);
	if (!meta) {
		throw new Error(`Missing sidecar "${metaPath}" for hike route "${entry.route}"`);
	}
	return withHikeMeta({ route: entry.route, properties: entry.properties } as Map, meta);
});
