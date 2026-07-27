import { getAllPosts, getPosts } from '$lib/hikes/hikes-info.server';
import { error, redirect } from '@sveltejs/kit';

export const prerender = 'auto';

export function entries() {
	const posts = getAllPosts();
	const tags = [...new Set(posts.flatMap(p => p.tags))];
	return tags.flatMap(tag => {
		const { pagination } = getPosts({ page: 1, tag });
		return Array.from({ length: pagination.totalPages - 1 }, (_, i) => ({ tag, page: String(i + 2) }));
	});
}

export function load({ params }) {
	const page = parseInt(params.page);
	const tag = decodeURIComponent(params.tag);
	if (isNaN(page) || page < 1) {
		throw error(404, 'Invalid page');
	}

	if (page === 1) {
		throw redirect(301, `/hikes/tag/${encodeURIComponent(tag)}/`);
	}

	const { posts, pagination } = getPosts({ page, tag });

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
		showPeople: false,
		header: {
			fixedNavbar: true
		}
	};
}