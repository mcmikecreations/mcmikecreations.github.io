import { getAllBlogPosts, getBlogPosts } from '$lib/blog/blog-posts.server';
import { error } from '@sveltejs/kit';

export const prerender = true;

export function entries() {
	const posts = getAllBlogPosts();
	const tags = [...new Set(posts.flatMap(p => p.tags))];
	return tags.map(tag => ({ tag }));
}

export function load({ params }: { params: { tag: string } }) {
	const tag = decodeURIComponent(params.tag);
	const { posts, pagination } = getBlogPosts({ page: 1, tag });
	const yearList = [...new Set(getAllBlogPosts().map(p => p.year))].sort((a, b) => b - a);

	if (posts.length === 0) {
		throw error(404, 'Tag not found or no posts');
	}

	return {
		posts,
		pagination,
		tag,
		yearList,
	};
}
