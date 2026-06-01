import { getAllBlogPosts, getBlogPosts } from '$lib/blog/blog-info';
import { error } from '@sveltejs/kit';

export const prerender = true;

export function entries() {
	const years = [...new Set(getAllBlogPosts().map(p => p.year))];
	return years.map(year => ({ year: String(year) }));
}

export function load({ params }: { params: { year: string } }) {
	const year = parseInt(params.year);
	if (isNaN(year)) throw error(404, 'Invalid year');

	const { posts, pagination } = getBlogPosts({ page: 1, year });
	const yearList = [...new Set(getAllBlogPosts().map(p => p.year))].sort((a, b) => b - a);

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
