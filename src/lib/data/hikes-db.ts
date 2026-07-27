/**
 * The hike database: `hikes.json` recombined with the per-slug `<slug>.hike.json` sidecars
 * that carry the hand-authored map fields (`name`, `description`, `image`,
 * `origin`, `height`, `checkpoints`, `nodes`).
 *
 * The sidecars live next to the hike markdown under `static/` and are inlined
 * at build time, so this module stays safe in the client bundle.
 */

import routes from './hikes.json';
import type { HikeMeta, Map } from './map-info';

const sidecars = import.meta.glob('/static/_projects/data-viz/hikes/markdown/*.hike.json', {
	eager: true,
	import: 'default'
}) as Record<string, HikeMeta>;

const metaBySlug: Record<string, HikeMeta> = {};
for (const [key, meta] of Object.entries(sidecars)) {
	const file = key.substring(key.lastIndexOf('/') + 1);
	metaBySlug[file.replace(/\.hike\.json$/, '')] = meta;
}

/** Route slug, e.g. `/projects/data-viz/hikes/seekarkreuz` -> `seekarkreuz`. */
export function hikeSlug(route: string): string {
	return route.substring(route.lastIndexOf('/') + 1);
}

/** Every hike, in `hikes.json` order, with its sidecar folded back in. */
export const hikes: Map[] = routes.map((entry) => {
	const slug = hikeSlug(entry.route);
	const meta = metaBySlug[slug];
	if (!meta) {
		throw new Error(`Missing sidecar ${slug}.hike.json for hike route "${entry.route}"`);
	}
	const { name, description, image, origin, height, checkpoints, nodes } = meta;
	return {
		name,
		image,
		properties: {
			...entry.properties,
			checkpoints,
			// 56 hikes have no nodes at all; leave the key off rather than
			// inventing an empty array.
			...(nodes === undefined ? {} : { nodes })
		},
		description,
		route: entry.route,
		height,
		standardFeatures: { origin }
	} as Map;
});
