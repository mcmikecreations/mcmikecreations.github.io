import { generateMeCard } from '$lib/contact';

export const prerender = true;

export function GET() {
	return new Response(generateMeCard(), {
		headers: {
			'Content-Type': 'text/plain; charset=utf-8',
			'Content-Disposition': 'attachment; filename="contact.mecard"',
		},
	});
}