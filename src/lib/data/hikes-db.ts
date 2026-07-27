/**
 * Sidecar helpers: the per-slug `<slug>.hike.json` files that carry each hike's
 * hand-authored map fields (`name`, `description`, `image`, `origin`, `height`,
 * `checkpoints`, `nodes`), plus the conventions for locating a hike's files.
 *
 * The sidecars are the definitive list of which hikes exist — one per hike,
 * whether or not it has been blogged. Assembling whole hikes needs the markdown
 * as well, so that lives in the server-only `hikes.server`.
 *
 * Two things are addressable rather than derived, so a hike (or a single post on
 * it) can point somewhere other than the slug-named default:
 *
 *  - `metaPath` — which sidecar supplies the fields above.
 *  - `filePath` — which GeoJSON supplies the route geometry.
 *
 * Both may be set on a hike, on a single date, or in a post's front matter; see
 * `resolveHikeForDate` and `frontmatter.server`.
 */

import type { HikeMeta, Map, MapDate, MapProperties } from './map-info';

const metaFolder = '/_projects/data-viz/hikes/markdown';
const geoFolder = '/_projects/data-viz/hikes/geojson';
const routeFolder = '/projects/data-viz/hikes';

const sidecars = import.meta.glob('/static/_projects/data-viz/hikes/markdown/*.hike.json', {
	eager: true,
	import: 'default'
}) as Record<string, HikeMeta>;

/** Route slug, e.g. `/projects/data-viz/hikes/seekarkreuz` -> `seekarkreuz`. */
export function hikeSlug(route: string): string {
	return route.substring(route.lastIndexOf('/') + 1);
}

/** The page a hike lives at. */
export function hikeRoute(slug: string): string {
	return `${routeFolder}/${slug}`;
}

/** Where a hike's sidecar lives unless something says otherwise. */
export function defaultMetaPath(slug: string): string {
	return `${metaFolder}/${slug}.hike.json`;
}

/** Where a hike's route GeoJSON lives unless something says otherwise. */
export function defaultFilePath(slug: string): string {
	return `${geoFolder}/${slug}.json`;
}

/** Every hike's slug, taken from the sidecars on disk. */
export const hikeSlugs: string[] = Object.keys(sidecars)
	.map((key) => key.substring(key.lastIndexOf('/') + 1).replace(/\.hike\.json$/, ''))
	.sort();

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
 * nothing.
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
 * A blogged date already carries its post's front-matter fields, folded in when
 * the model was built, so this covers front matter too for everything at date
 * level. Hike-level front-matter keys still need `applyPostOverrides`.
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
