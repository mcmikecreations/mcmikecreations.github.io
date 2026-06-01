import { getAllBlogPosts, getBlogPosts } from '$lib/blog/blog-info';

export const prerender = true;

export function load() {
	const { posts, pagination } = getBlogPosts({ page: 1 });
	const yearList = [...new Set(getAllBlogPosts().map(p => p.year))].sort((a, b) => b - a);

	return {
		posts,
		pagination,
		yearList,
		footer: {
			pinBottom: false,
			showSocials: true,
		},
	};
}
