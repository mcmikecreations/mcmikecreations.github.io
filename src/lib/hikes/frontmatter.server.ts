/**
 * Server-only front matter parsing + override merging.
 *
 * Override rule: a value written in a post's front matter wins over the matching
 * field from the hike database (`hikes-db`), but only when it is present and not
 * null. Anything omitted (or explicitly null) falls back to the database value,
 * so posts without front matter behave exactly as they did before.
 */

import matter from 'gray-matter';
import type { Map, MapDate } from '$lib/data/map-info';
import { isPlainObject } from '$lib/hikes/frontmatter';

/**
 * Keys that are NOT overridden by a raw front-matter spread, per level.
 *
 * These fall into two groups:
 *  - Identity: locating the hike/date/file. Overriding them would desync the
 *    slug (`route`, date `date`), the already-fetched markdown (date `path`),
 *    so they stay fixed.
 *  - Handled elsewhere: `properties` and the top-level `dates` are not blocked —
 *    they are consumed by dedicated deep-merge paths in `applyHikeOverrides`
 *    (properties is merged field-by-field; `dates` becomes the single date-entry
 *    override). Spreading them raw would clobber the whole nested object.
 *
 * Everything not listed here IS overrideable, including
 * distance/duration/ascent/descent/filePath/nodes/draft in `properties`
 * and title/description/tags/people/image/gpx/author in the date entry.
 */
const HIKE_BLOCKED = new Set(['route', 'properties', 'dates']);
// The nested `properties.dates` array is structural; the single date entry is
// supplied via the top-level `dates` object instead.
const PROPS_BLOCKED = new Set(['dates']);
const DATE_BLOCKED = new Set(['date', 'path']);

type Dict = Record<string, unknown>;

/** Copy only the keys whose value is present and not null, skipping any in `blocked`. */
function pickOverrides(source: unknown, blocked: Set<string>): Dict {
	const out: Dict = {};
	if (!isPlainObject(source)) return out;
	for (const [key, value] of Object.entries(source)) {
		if (blocked.has(key)) continue;
		if (value === null || value === undefined) continue;
		out[key] = value;
	}
	return out;
}

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

/**
 * Apply front matter overrides onto a hike and its (single) matched date entry.
 *
 * Front matter mirrors an assembled hike entry, except `dates` is a single object
 * (one blog post per hike date) rather than an array. Returns fresh copies; the
 * originals (and the imported JSON) are left untouched.
 */
export function applyHikeOverrides<H extends Map>(
	hike: H,
	date: MapDate,
	frontmatter: Dict | null | undefined
): { hike: H; date: MapDate } {
	if (!isPlainObject(frontmatter) || Object.keys(frontmatter).length === 0) {
		return { hike, date };
	}

	// The single date entry may be written as an object, or (leniently) as a
	// one-element array; anything else is ignored.
	const rawDate = frontmatter.dates;
	const dateSource = Array.isArray(rawDate) ? rawDate[0] : rawDate;

	const mergedHike = {
		...hike,
		...pickOverrides(frontmatter, HIKE_BLOCKED),
		properties: {
			...hike.properties,
			...pickOverrides(frontmatter.properties, PROPS_BLOCKED)
		}
	} as H;

	const mergedDate: MapDate = {
		...date,
		...pickOverrides(dateSource, DATE_BLOCKED)
	};

	return { hike: mergedHike, date: mergedDate };
}
