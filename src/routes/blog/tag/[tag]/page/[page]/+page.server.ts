import { getAllBlogPosts, getBlogPosts } from '$lib/blog/blog-posts.server';
import { error, redirect } from '@sveltejs/kit';

export const prerender = 'auto';

export function entries() {
	const posts = getAllBlogPosts();
	const tags = [...new Set(posts.flatMap(p => p.tags))];
	return tags.flatMap(tag => {
		const { pagination } = getBlogPosts({ page: 1, tag });
		return Array.from({ length: pagination.totalPages }, (_, i) => ({ tag, page: String(i + 1) }));
	});
}

export function load({ params }: { params: { tag: string; page: string } }) {
	const page = parseInt(params.page);
	const tag = decodeURIComponent(params.tag);

	if (isNaN(page) || page < 1) {
		throw error(404, 'Invalid page');
	}

	if (page === 1) {
		throw redirect(301, `/blog/tag/${encodeURIComponent(tag)}/`);
	}

	const { posts, pagination } = getBlogPosts({ page, tag });

	if (page > pagination.totalPages && pagination.totalPosts > 0) {
		throw error(404, 'Page not found');
	}

	if (posts.length === 0) {
		throw error(404, 'Tag not found or no posts');
	}

	return {
		posts,
		pagination,
		tag,
	};
}
