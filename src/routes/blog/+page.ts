import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = async () => {
	try {
		// Get blog posts.
		const prefix = '/static/_blog/';
		const postRegex = /\/static\/_blog\/(\d{4})-(\d{2})-(\d{2})-(.+)\.md/;
		const currentDate = new Date();

		const posts = Object.keys(
			import.meta.glob('/static/_blog/*.md', { as: 'url' })
		).map(
			k => {
				const url = '/blog/' + k.slice(prefix.length, k.length - 3);
				const match = postRegex.exec(k);

				if (match == null) {
					return {
						year: currentDate.getFullYear(),
						month: currentDate.getMonth(),
						day: currentDate.getDate(),
						title: 'Unnamed post',
						url: url,
					};
				} else {
					const title = match[4].replaceAll('-', ' ');
					return ({
						year: match[1],
						month: match[2],
						day: match[3],
						title: title.charAt(0).toUpperCase() + title.slice(1),
						url: url,
					});
				}
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