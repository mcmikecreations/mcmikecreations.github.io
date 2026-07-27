import { getAllPosts, getPosts } from '$lib/hikes/hikes-info.server';
import { error, redirect } from '@sveltejs/kit';

export const prerender = 'auto';

export function entries() {
	const { pagination } = getPosts({ page: 1 });
	return Array.from({ length: pagination.totalPages - 1 }, (_, i) => ({ page: String(i + 2) }));
}

export function load({ params }) {
	const page = parseInt(params.page);
	if (isNaN(page) || page < 1) {
		throw error(404, 'Invalid page');
	}

	if (page === 1) {
		throw redirect(301, '/hikes/');
	}

	const { posts, pagination } = getPosts({ page });

	if (page > pagination.totalPages && pagination.totalPosts > 0) {
		throw error(404, 'Page not found');
	}

	return {
		posts,
		pagination,
		showPeople: false,
		header: {
			fixedNavbar: true
		}
	};
}