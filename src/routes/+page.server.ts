import { getBlogPosts } from '$lib/blog/blog-posts.server';

export function load() {
	const { posts } = getBlogPosts({ page: 1, limit: 3 });
	return { blogPosts: posts };
}
