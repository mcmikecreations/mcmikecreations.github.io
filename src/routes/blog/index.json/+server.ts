import { json } from '@sveltejs/kit';
import { getAllBlogMeta } from '$lib/blog/blog-posts.server';

export const prerender = true;

export function GET() {
	const entries = getAllBlogMeta().map(m => ({
		title: m.title,
		date: m.date,
		image: m.image ?? undefined,
		imageFull: m.imageFull ?? undefined,
		description: m.description,
		author: m.author,
		tags: m.tags,
		url: `/blog/${m.anchor}/`,
	}));

	return json(entries);
}
