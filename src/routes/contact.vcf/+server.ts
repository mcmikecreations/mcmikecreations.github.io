import { generateVCard } from '$lib/contact';

export const prerender = true;

export function GET() {
	return new Response(generateVCard(), {
		headers: {
			'Content-Type': 'text/vcard; charset=utf-8',
			'Content-Disposition': 'attachment; filename="contact.vcf"',
		},
	});
}