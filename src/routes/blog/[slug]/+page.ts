import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import type { HttpError } from '@sveltejs/kit'

export const load: PageLoad = async ({ fetch, params }) => {
	try {
		// Get the post.
		const url = `/_blog/${params.slug}.md`;
		const res = await fetch(url);

		if (!res.ok) {
			console.log(`Failed to fetch ${url} with return code ${res.status}.`);
			error(404, { message: `Failed to fetch "${params.slug}"` });
		}

		// Find all headers. The first one will be the page title.
		const post = await res.text();
		const headerRegex = /#{1,6} (.*)\r?\n/g;
		const headers = Array.from(post.matchAll(headerRegex), x => x[1]);
		return {
			post: {
				title: headers[0],
				content: post,
			},
		};
	} catch (ex) {
		if ((ex as HttpError) !== undefined) {
			throw ex;
		} else {
			console.log(ex);
			error(500);
		}
	}
};