import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch, params }) => {
	try {
		// Get the post list.
		const url = '/_blog/blogs.json';
		const res = await fetch(url);

		if (!res.ok) {
			console.log(`Failed to fetch ${url} with return code ${res.status}.`);
			error(500);
		}

		const blogs = await res.json();

		const posts = blogs.map(
			k => {
				const url = '/blog/' + k.path.substring(0, k.path.length - 3);
				const date = new Date(k.date);

				return ({
					year: date.getFullYear(),
					month: date.getMonth(),
					day: date.getDate(),
					title: k.title,
					url: url,
					image: k.image,
					description: k.description,
				});
			}
		);

		return {
			posts: posts,
		};
	} catch (ex) {
		console.log(ex);
		error(404);
	}
};