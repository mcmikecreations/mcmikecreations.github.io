import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import blogs from '$lib/data/blogs.json';

export const load: PageLoad = async () => {
	try {
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