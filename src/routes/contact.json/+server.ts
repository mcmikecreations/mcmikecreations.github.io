import { generateJCard } from '$lib/contact';

export const prerender = true;

export function GET() {
	return new Response(generateJCard(), {
		headers: { 'Content-Type': 'application/json' },
	});
}