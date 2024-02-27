import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import type { HttpError } from '@sveltejs/kit'
import blogs from '$lib/data/blogs.json';
import { readingTime } from 'reading-time-estimator';

export const load: PageLoad = async ({ fetch, params }) => {
	try {
		// Get the post.
		const fileName = `${params.slug}.md`;
		const url = `/_blog/${fileName}`;
		const res = await fetch(url);

		if (!res.ok) {
			console.log(`Failed to fetch ${url} with return code ${res.status}.`);
			error(404, { message: `Failed to fetch "${params.slug}"` });
		}

		const meta = blogs.find((x) => x.path === fileName);

		if (!meta) {
			console.log(`Failed to fetch ${fileName} metadata.`);
			error(404, { message: `Failed to fetch "${params.slug}"` });
		}

		// Find all headers.
		const post = await res.text();
		const headerRegex = /#{2} (.*)\r?\n/g;
		const headers = Array.from(post.matchAll(headerRegex), x => x[1]);
		const stats = readingTime(post);
		return {
			post: {
				title: meta.title,
				content: post,
				headers: headers,
				time: stats.text,
				date: new Date(meta.date).toLocaleDateString('en-us', { year:"numeric", month:"short", day:"numeric"}),
				tags: meta.tags,
				author: meta.author,
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