/**
 * Server-only index of every hike post's front matter, parsed once at build time.
 *
 * The post page reads its own markdown over HTTP because it needs the body
 * anyway. Views that summarise *many* hikes cannot do that — they would need one
 * request per post — so they read front matter from this glob instead. Mirrors
 * `blog-posts.server.ts`.
 *
 * This exists because per-post overrides (metrics, `filePath`, `metaPath`) live
 * in the markdown: a view that only read `hikes.json` would quietly miss them.
 */

import type { Map, MapDate } from '$lib/data/map-info';
import { applyPostOverrides, readHikeFrontmatter } from '$lib/hikes/frontmatter.server';

// Raw markdown for every hike post, keyed by glob path, inlined into the bundle.
const rawFiles = import.meta.glob('/static/_projects/data-viz/hikes/markdown/*.md', {
	eager: true,
	query: '?raw',
	import: 'default'
}) as Record<string, string>;

type Dict = Record<string, unknown>;

/** Front matter per served path, e.g. `/_projects/.../2025-03-02-seekarkreuz.md`. */
const frontmatterByPath: Record<string, Dict> = {};
for (const [key, raw] of Object.entries(rawFiles)) {
	frontmatterByPath[key.replace(/^\/static/, '')] = readHikeFrontmatter(raw).data;
}

/** A post's parsed front matter, or undefined for a date with no markdown. */
export function getPostFrontmatter(path: string | null | undefined): Dict | undefined {
	return path ? frontmatterByPath[path] : undefined;
}

/**
 * The hike as one of its dates sees it, front matter included — the same
 * resolution the post page performs, for dates that have a post. Dates without
 * one fall back to their `hikes.json` values.
 *
 * Read metrics and geometry from the returned `properties`.
 */
export function resolveHikeForPost(hike: Map, date: MapDate): { hike: Map; properties: Map['properties'] } {
	const { hike: merged, properties } = applyPostOverrides(hike, date, getPostFrontmatter(date.path));
	return { hike: merged, properties };
}
