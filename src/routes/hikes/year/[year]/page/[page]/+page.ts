import { getAllPosts, getPosts } from '$lib/data/hikes-info';
import { error } from '@sveltejs/kit';

export const prerender = false;

export function load({ params }) {
	const page = parseInt(params.page);
	const year = parseInt(params.year);
	if (isNaN(page) || page < 1 || isNaN(year)) {
		throw error(404, 'Invalid page or year');
	}

	const { posts, pagination } = getPosts({ page, limit: 10, year });

	if (page > pagination.totalPages && pagination.totalPosts > 0) {
		throw error(404, 'Page not found');
	}

	if (posts.length === 0) {
		throw error(404, 'Year not found or no posts');
	}

	const yearList = [...new Set(getAllPosts().map(p => p.year))].sort((a, b) => b - a);

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

