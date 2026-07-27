/**
 * Server-only front matter parsing + override merging.
 *
 * Front matter is flat: one key per field, no nested `properties` / `dates` /
 * `standardFeatures` blocks. Each key is routed to the level that owns the field
 * (see the key sets below), which is why the merge is an explicit mapping rather
 * than a spread.
 *
 * Override rule: a value written in a post's front matter wins over the matching
 * field from the hike database (`hikes-db`), but only when it is present and not
 * null. Anything omitted (or explicitly null) falls back to the database value,
 * so posts without front matter behave exactly as they did before — and no key
 * can clear a value back to null.
 */

import matter from 'gray-matter';
import { applyDateOverrides, getHikeMeta, withHikeMeta } from '$lib/data/hikes-db';
import type { Map, MapDate, MapProperties, OriginData } from '$lib/data/map-info';
import { isPlainObject } from '$lib/hikes/frontmatter';

/**
 * Keys that set fields on the hike itself.
 *
 * `name` has a post-level counterpart in `title`, so both survive flattening.
 * The hike's own `description` and `image` do not — those keys mean the post's,
 * below — so a route's shared text lives in its `<slug>.hike.json` sidecar.
 */
const HIKE_KEYS = new Set(['name', 'height']);

/** Keys that set fields on the hike's `properties`. */
const PROPS_KEYS = new Set(['draft', 'hidden', 'checkpoints', 'nodes']);

/**
 * Keys that set fields on this post's date entry.
 *
 * `filePath` and the four metrics exist at both levels in `hikes.json`, with the
 * same meaning; flattened they land here, the more specific level, which is
 * where they already won from.
 */
const DATE_KEYS = new Set([
	'title',
	'description',
	'image',
	'tags',
	'people',
	'author',
	'gpx',
	'filePath',
	'metaPath',
	'distance',
	'duration',
	'ascent',
	'descent'
]);

/**
 * Keys with no override slot at all:
 *  - `route`, and a date's `date` / `path` — identity. Overriding them would
 *    desync the slug or the already-fetched markdown.
 *  - `origin` is handled on its own, below, since it nests inside
 *    `standardFeatures`.
 *  - `contacts` has its own reader, `readHikeContacts`, and is display-only.
 * Anything else is ignored rather than spread onto the hike, so a typo cannot
 * quietly enter the page payload.
 */

type Dict = Record<string, unknown>;

/**
 * Parse a hike markdown file, returning the raw front matter data and the body
 * with the front matter removed. Never throws: malformed YAML logs and yields an
 * empty object with the original text as the body.
 */
export function readHikeFrontmatter(raw: string): { data: Dict; content: string } {
	try {
		const parsed = matter(raw);
		return { data: (parsed.data ?? {}) as Dict, content: parsed.content };
	} catch (ex) {
		console.log('Failed to parse hike front matter:', ex);
		return { data: {}, content: raw };
	}
}

function readString(value: unknown): string | null {
	return typeof value === 'string' && value.trim().length > 0 ? value.trim() : null;
}

/**
 * Which sidecar this post wants, if it wants one other than the hike's own:
 * front matter first, then the date's `metaPath` in `hikes.json`. A hike-level
 * `properties.metaPath` needs no mention — `hikes-db` has already applied it.
 * Returns null when nothing overrides it.
 */
export function readMetaPathOverride(
	frontmatter: Dict | null | undefined,
	date: MapDate
): string | null {
	const fm = isPlainObject(frontmatter) ? frontmatter : undefined;
	return readString(fm?.metaPath) ?? readString(date.metaPath);
}

/**
 * The date-level fields a post's front matter declares, used to fold a post into
 * the model so downstream code can read `date.title`, `date.tags` and friends
 * without knowing front matter exists.
 */
export function readDateFields(frontmatter: Dict | null | undefined): Partial<MapDate> {
	const out: Dict = {};
	if (!isPlainObject(frontmatter)) return out;
	for (const [key, value] of Object.entries(frontmatter)) {
		if (value === null || value === undefined) continue;
		if (DATE_KEYS.has(key)) out[key] = value;
	}
	return out as Partial<MapDate>;
}

/**
 * Validate a front-matter `origin`. Throws rather than letting a malformed one
 * through, since a bad centre silently mis-projects the whole map.
 */
function readOrigin(value: unknown, route: string): OriginData | null {
	if (value === null || value === undefined) return null;
	if (!isPlainObject(value) || typeof value.lat !== 'number' || typeof value.lon !== 'number') {
		throw new Error(
			`Front matter origin for hike route "${route}" must be { lat: <number>, lon: <number> }`
		);
	}
	return { lat: value.lat, lon: value.lon };
}

/**
 * Everything one post's front matter can change, in the right order.
 *
 * The single definition of that order, so the post page and the aggregate views
 * cannot drift:
 *
 *  1. swap in the sidecar the post asks for, if any — first, so a post that also
 *     sets one of the sidecar's own fields by hand keeps its own value;
 *  2. route each flat key to its level and merge;
 *  3. promote the date's `filePath` and pinned metrics into `properties`.
 *
 * `properties` is the effective set to read metrics and geometry from; the
 * returned `hike` still carries the pre-promotion `properties`, so callers that
 * want the merged view should use the `properties` field.
 *
 * Throws on a `metaPath` that names no known sidecar, rather than quietly
 * rendering the wrong map.
 */
export function applyPostOverrides(
	hike: Map,
	date: MapDate,
	frontmatter: Dict | null | undefined
): { hike: Map; date: MapDate; properties: MapProperties } {
	let base = hike;

	const metaPath = readMetaPathOverride(frontmatter, date);
	if (metaPath) {
		const meta = getHikeMeta(metaPath);
		if (!meta) {
			throw new Error(`Unknown sidecar "${metaPath}" for hike route "${hike.route}"`);
		}
		base = withHikeMeta(base, meta);
	}

	const fm = isPlainObject(frontmatter) ? frontmatter : {};

	const hikeOverrides: Dict = {};
	const propsOverrides: Dict = {};
	const dateOverrides: Dict = {};
	for (const [key, value] of Object.entries(fm)) {
		if (value === null || value === undefined) continue;
		if (DATE_KEYS.has(key)) dateOverrides[key] = value;
		else if (PROPS_KEYS.has(key)) propsOverrides[key] = value;
		else if (HIKE_KEYS.has(key)) hikeOverrides[key] = value;
	}

	const origin = readOrigin(fm.origin, hike.route);

	const mergedHike: Map = {
		...base,
		...hikeOverrides,
		...(origin ? { standardFeatures: { origin } } : {}),
		properties: { ...base.properties, ...propsOverrides }
	};
	const mergedDate: MapDate = { ...date, ...dateOverrides };

	return {
		hike: mergedHike,
		date: mergedDate,
		properties: applyDateOverrides(mergedHike.properties, mergedDate)
	};
}
