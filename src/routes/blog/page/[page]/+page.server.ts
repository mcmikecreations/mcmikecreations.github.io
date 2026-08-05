import { getBlogPosts } from '$lib/blog/blog-posts.server';
import { error, redirect } from '@sveltejs/kit';

export const prerender = 'auto';

export function entries() {
	const { pagination } = getBlogPosts({ page: 1 });
	return Array.from({ length: pagination.totalPages }, (_, i) => ({ page: String(i + 1) }));
}

export function load({ params }: { params: { page: string } }) {
	const page = parseInt(params.page);

	if (isNaN(page) || page < 1) {
		throw error(404, 'Invalid page');
	}

	if (page === 1) {
		throw redirect(301, '/blog/');
	}

	const { posts, pagination } = getBlogPosts({ page });

	if (page > pagination.totalPages && pagination.totalPosts > 0) {
		throw error(404, 'Page not found');
	}

	return {
		posts,
		pagination,
	};
}
