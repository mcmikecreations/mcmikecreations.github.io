import { json } from '@sveltejs/kit';
import blogs from '$lib/data/blogs.json';

export const prerender = true;

export interface SearchEntry {
	url: string;
	title: string;
	description: string;
	tags: string[];
	date: string;
	image?: string;
}

export function GET() {
	const entries: SearchEntry[] = (blogs as { title: string; date: string; image?: string | null; description?: string; path: string; tags: string[] }[]).map(k => {
		const anchor = k.path.substring(0, k.path.length - 3);
		return {
			url: `/blog/${anchor}/`,
			title: k.title,
			description: k.description ?? '',
			tags: k.tags,
			date: k.date,
			image: k.image ?? undefined,
		};
	});

	entries.sort((a, b) => (a.date > b.date ? -1 : a.date < b.date ? 1 : 0));

	return json(entries);
}
