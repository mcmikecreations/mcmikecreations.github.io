import { json } from '@sveltejs/kit';
import { hikes } from '$lib/hikes/hikes.server';

export const prerender = true;

export function GET() {
	return json(hikes);
}
