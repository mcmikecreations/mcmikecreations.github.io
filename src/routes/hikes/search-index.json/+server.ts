import { json } from '@sveltejs/kit';
import hikes from '$lib/data/hikes.json';
import type { Map } from '$lib/data/map-info';

export const prerender = true;

export interface SearchEntry {
	url: string;
	title: string;
	hikeName: string;
	nodeNames: string[];
	tags: string[];
	description: string;
	date: string;
	image?: string;
}

export function GET() {
	const entries: SearchEntry[] = (hikes as Map[]).flatMap((h) =>
		h.properties.dates
			.filter((d) => !h.properties.draft && d.path)
			.map((d) => {
				const slug = h.route.substring(h.route.lastIndexOf('/') + 1);
				const nodeNames = (h.properties.nodes ?? [])
					.map((n) => n.tags?.name)
					.filter((name): name is string => !!name);
				return {
					url: `/hikes/${d.date}-${slug}/`,
					title: d.title ?? h.name,
					hikeName: h.name,
					nodeNames,
					tags: d.tags,
					description: ((d.description ?? '') + ' ' + h.description).trim(),
					date: d.date,
					image: (d.image ?? h.image)?.replace('/hikes/', '/hikes/thumb/') ?? undefined
				};
			})
	);

	entries.sort((a, b) => (a.date > b.date ? -1 : a.date < b.date ? 1 : 0));

	return json(entries);
}
