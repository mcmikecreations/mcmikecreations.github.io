import { json } from '@sveltejs/kit';
import { hikes } from '$lib/data/hikes-db';
import type { Map } from '$lib/data/map-info';
import { hashPeople } from '$lib/hikes/name-hash';

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
	peopleHashes: string[];
}

export async function GET() {
	const entries: SearchEntry[] = [];

	for (const h of hikes as Map[]) {
		const slug = h.route.substring(h.route.lastIndexOf('/') + 1);
		const nodeNames = (h.properties.nodes ?? [])
			.map((n) => n.tags?.name)
			.filter((name): name is string => !!name);

		for (const d of h.properties.dates) {
			if (h.properties.draft || !d.path) continue;
			entries.push({
				url: `/hikes/${d.date}-${slug}/`,
				title: d.title ?? h.name,
				hikeName: h.name,
				nodeNames,
				tags: d.tags,
				description: ((d.description ?? '') + ' ' + h.description).trim(),
				date: d.date,
				image: (d.image ?? h.image)?.replace('/hikes/', '/hikes/thumb/') ?? undefined,
				peopleHashes: await hashPeople(d.people ?? [])
			});
		}
	}

	entries.sort((a, b) => (a.date > b.date ? -1 : a.date < b.date ? 1 : 0));

	return json(entries);
}
