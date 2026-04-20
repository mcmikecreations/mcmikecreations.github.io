import { json } from '@sveltejs/kit';
import hikes from '$lib/data/hikes.json';

export const prerender = true;

export function GET() {
	return json(hikes);
}
