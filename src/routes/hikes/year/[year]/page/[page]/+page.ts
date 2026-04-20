import { getAllPosts, getPosts } from '$lib/hikes/hikes-info';
import { error, redirect } from '@sveltejs/kit';

export const prerender = 'auto';

export function entries() {
	const years = [...new Set(getAllPosts().map(p => p.year))];
	return years.flatMap(year => {
		const { pagination } = getPosts({ page: 1, year });
		return Array.from({ length: pagination.totalPages - 1 }, (_, i) => ({ year: String(year), page: String(i + 2) }));
	});
}

export function load({ params }) {
	const page = parseInt(params.page);
	const year = parseInt(params.year);
	if (isNaN(page) || page < 1 || isNaN(year)) {
		throw error(404, 'Invalid page or year');
	}

	if (page === 1) {
		throw redirect(301, `/hikes/year/${year}/`);
	}

	const { posts, pagination } = getPosts({ page, year });

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