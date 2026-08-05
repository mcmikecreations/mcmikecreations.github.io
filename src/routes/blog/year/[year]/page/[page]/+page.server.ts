import { getAllBlogPosts, getBlogPosts } from '$lib/blog/blog-posts.server';
import { error, redirect } from '@sveltejs/kit';

export const prerender = 'auto';

export function entries() {
	const years = [...new Set(getAllBlogPosts().map(p => p.year))];
	return years.flatMap(year => {
		const { pagination } = getBlogPosts({ page: 1, year });
		return Array.from({ length: pagination.totalPages }, (_, i) => ({ year: String(year), page: String(i + 1) }));
	});
}

export function load({ params }: { params: { year: string; page: string } }) {
	const page = parseInt(params.page);
	const year = parseInt(params.year);

	if (isNaN(page) || page < 1 || isNaN(year)) {
		throw error(404, 'Invalid page or year');
	}

	if (page === 1) {
		throw redirect(301, `/blog/year/${year}/`);
	}

	const { posts, pagination } = getBlogPosts({ page, year });
	const yearList = [...new Set(getAllBlogPosts().map(p => p.year))].sort((a, b) => b - a);

	if (page > pagination.totalPages && pagination.totalPosts > 0) {
		throw error(404, 'Page not found');
	}

	if (posts.length === 0) {
		throw error(404, 'Year not found or no posts');
	}

	return {
		posts,
		pagination,
		year,
		yearList,
	};
}
