import { generateHCard } from '$lib/contact';

export const prerender = true;

export function GET() {
	return new Response(generateHCard(), {
		headers: { 'Content-Type': 'text/html; charset=utf-8' },
	});
}