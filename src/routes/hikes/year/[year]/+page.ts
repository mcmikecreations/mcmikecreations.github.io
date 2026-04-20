import { getAllPosts, getPosts } from '$lib/hikes/hikes-info';
import { error } from '@sveltejs/kit';

export const prerender = true;

export function entries() {
	const years = [...new Set(getAllPosts().map(p => p.year))];
	return years.map(year => ({ year: String(year) }));
}

export function load({ params }) {
	const year = parseInt(params.year);
	if (isNaN(year)) throw error(404, 'Invalid year');
	const { posts, pagination } = getPosts({ page: 1, year });
	const yearList = [...new Set(getAllPosts().map(p => p.year))].sort((a, b) => b - a);

	if (posts.length === 0) {
		throw error(404, 'Year not found or no posts');
	}

	return {
		posts,
		yearList,
		pagination,
		year,
		showPeople: false,
		header: {
			fixedNavbar: true
		}
	};
}