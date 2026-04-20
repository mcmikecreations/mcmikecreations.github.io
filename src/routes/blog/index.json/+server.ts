import { json } from '@sveltejs/kit';
import blogs from '$lib/data/blogs.json';

export const prerender = true;

export function GET() {
	return json(blogs);
}
