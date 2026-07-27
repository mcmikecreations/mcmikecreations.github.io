import { error } from '@sveltejs/kit';
import { hikes } from '$lib/hikes/hikes.server';
import type { PageServerLoad } from './$types';

/**
 * Just this hike, handed to the universal load.
 *
 * The heavy lifting stays universal — it builds THREE objects, which cannot
 * cross a server boundary — but looking the hike up needs the markdown glob. A
 * `fetch('/hikes/index.json')` from the universal load would work too, except
 * SvelteKit then inlines the whole response into every prerendered page, which
 * nearly doubled each one.
 */
export const load: PageServerLoad = ({ params }) => {
	const meta = hikes.find((h) => h.route.split('/').pop() === params.slug);
	if (!meta) {
		console.log(`Failed to fetch /maps/${params.slug} metadata.`);
		error(404, { message: `Failed to fetch "${params.slug}"` });
	}
	return { meta };
};
