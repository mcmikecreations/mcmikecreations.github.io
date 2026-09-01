/**
 * The hike database, assembled at build time from three sources:
 *
 *  - `<slug>.hike.json` sidecars — one per hike: the hand-authored map fields,
 *    and the definitive list of which hikes exist.
 *  - `<date>-<slug>.md` posts — one per blogged date. The filename supplies the
 *    date and the route; the front matter supplies that date's own fields.
 *  - `hikes.json` — only what neither of those can say: dates with no post yet,
 *    `draft` / `hidden`, metric fallbacks for those dates, and the rare path
 *    that breaks convention.
 *
 * A blogged date therefore needs no entry in `hikes.json` at all, which is why
 * only the hikes still missing a post are left in it.
 *
 * Server-only: it globs markdown, which must not reach the client bundle.
 * Browser code reads the prerendered `/hikes/index.json` instead.
 */

import routes from '$lib/data/hikes.json';
import {
	applyDateOverrides,
	defaultFilePath,
	defaultGpxPath,
	defaultMetaPath,
	getHikeMeta,
	hasGpxFile,
	hikeRoute,
	hikeSlug,
	hikeSlugs,
	withHikeMeta
} from '$lib/data/hikes-db';
import type { Map, MapDate, MapProperties } from '$lib/data/map-info';
import { applyPostOverrides, readDateFields, readHikeFrontmatter } from '$lib/hikes/frontmatter.server';

type Dict = Record<string, unknown>;

/** `hikes.json` carries only overrides, so it is not a `Map` on its own. */
const overrides = routes as unknown as Array<{ route: string; properties: Partial<MapProperties> }>;

// Raw markdown for every hike post, keyed by glob path, inlined into the bundle.
const rawFiles = import.meta.glob('/static/_projects/data-viz/hikes/markdown/*.md', {
	eager: true,
	query: '?raw',
	import: 'default'
}) as Record<string, string>;

/** `2025-03-02-seekarkreuz.md` -> date `2025-03-02`, slug `seekarkreuz`. */
const POST_FILE = /^(\d{4}-\d{2}-\d{2})-(.+)\.md$/;

const frontmatterByPath: Record<string, Dict> = {};
const postsBySlug: Record<string, MapDate[]> = {};

for (const [key, raw] of Object.entries(rawFiles)) {
	const file = key.substring(key.lastIndexOf('/') + 1);
	const match = POST_FILE.exec(file);
	if (!match) {
		throw new Error(`Hike post "${file}" is not named <date>-<slug>.md`);
	}
	const [, date, slug] = match;
	const path = key.replace(/^\/static/, '');
	const frontmatter = readHikeFrontmatter(raw).data;
	frontmatterByPath[path] = frontmatter;

	// The post's own fields, folded onto the date so everything downstream can
	// keep reading `date.title`, `date.tags` and friends as it always has.
	(postsBySlug[slug] ??= []).push({
		date,
		path,
		tags: [],
		people: [],
		...readDateFields(frontmatter)
	} as MapDate);
}

const overrideBySlug: Record<string, Partial<MapProperties>> = {};
for (const entry of overrides) {
	overrideBySlug[hikeSlug(entry.route)] = entry.properties;
}

/** A date with no post: fill in the array defaults `hikes.json` no longer stores. */
function normaliseDate(date: MapDate): MapDate {
	return { ...date, tags: date.tags ?? [], people: date.people ?? [] };
}

/**
 * A date's GPX link: whatever front matter or `hikes.json` named, or else the
 * conventional path next to the route GeoJSON — but only when that file
 * actually exists, so a hike with no track recorded doesn't get a dead link.
 */
function withDefaultGpx(date: MapDate, hikeFilePath: string): MapDate {
	if (date.gpx) return date;
	const gpxPath = defaultGpxPath(date.filePath ?? hikeFilePath);
	return hasGpxFile(gpxPath) ? { ...date, gpx: gpxPath } : date;
}

function buildHike(slug: string): Map {
	const props = overrideBySlug[slug] ?? {};

	const metaPath = props.metaPath ?? defaultMetaPath(slug);
	const meta = getHikeMeta(metaPath);
	if (!meta) {
		throw new Error(`Missing sidecar "${metaPath}" for hike "${slug}"`);
	}

	const filePath = props.filePath ?? defaultFilePath(slug);
	const dates = [...(postsBySlug[slug] ?? []), ...(props.dates ?? []).map(normaliseDate)]
		.map((date) => withDefaultGpx(date, filePath))
		.sort((a, b) => (a.date > b.date ? -1 : a.date < b.date ? 1 : 0));
	if (dates.length === 0) {
		throw new Error(`Hike "${slug}" has no dates: no post, and none in hikes.json`);
	}

	const properties: MapProperties = {
		...props,
		filePath,
		draft: props.draft ?? false,
		dates
	};

	return withHikeMeta({ route: hikeRoute(slug), properties } as Map, meta);
}

for (const slug of Object.keys(postsBySlug)) {
	if (!hikeSlugs.includes(slug)) {
		throw new Error(`Hike post for "${slug}" has no ${slug}.hike.json sidecar`);
	}
}
for (const entry of overrides) {
	if (!hikeSlugs.includes(hikeSlug(entry.route))) {
		throw new Error(`hikes.json route "${entry.route}" has no sidecar`);
	}
}

/**
 * Every hike, newest first by its most recent date — the order the rest of the
 * site presents them in. `hikes.json`'s own order no longer means anything, as
 * most hikes are not in it.
 */
export const hikes: Map[] = hikeSlugs
	.map(buildHike)
	.sort((a, b) => {
		const da = a.properties.dates[0].date;
		const db = b.properties.dates[0].date;
		if (da !== db) return da > db ? -1 : 1;
		return a.route < b.route ? -1 : 1;
	});

/** A post's parsed front matter, or undefined for a date with no markdown. */
export function getPostFrontmatter(path: string | null | undefined): Dict | undefined {
	return path ? frontmatterByPath[path] : undefined;
}

/**
 * The hike as one of its dates sees it, front matter included — the same
 * resolution the post page performs.
 *
 * Date-level fields are already folded into the model, so this exists for the
 * hike-level front-matter keys (`name`, `height`, `origin`, `draft`, `hidden`,
 * `checkpoints`, `nodes`) and for promoting `filePath` / metrics into
 * `properties`. Read metrics and geometry from the returned `properties`.
 */
export function resolveHikeForPost(hike: Map, date: MapDate): { hike: Map; properties: MapProperties } {
	const frontmatter = getPostFrontmatter(date.path);
	if (!frontmatter) {
		return { hike, properties: applyDateOverrides(hike.properties, date) };
	}
	const { hike: merged, properties } = applyPostOverrides(hike, date, frontmatter);
	return { hike: merged, properties };
}
