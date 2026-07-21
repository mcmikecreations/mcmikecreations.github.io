import { json } from '@sveltejs/kit';
import { getAllBlogMeta } from '$lib/blog/blog-posts.server';

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
	const entries: SearchEntry[] = getAllBlogMeta().map(m => ({
		url: `/blog/${m.anchor}/`,
		title: m.title,
		description: m.description,
		tags: m.tags,
		date: m.date,
		image: m.image ?? undefined,
	}));

	entries.sort((a, b) => (a.date > b.date ? -1 : a.date < b.date ? 1 : 0));

	return json(entries);
}
