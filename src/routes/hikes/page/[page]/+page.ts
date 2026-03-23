import { getPosts } from '$lib/data/hikes-info';
import { error } from '@sveltejs/kit';

export const prerender = false;

export function load({ params }) {
    const page = parseInt(params.page);
    if (isNaN(page) || page < 1) {
        throw error(404, 'Invalid page');
    }

    const { posts, pagination } = getPosts({ page, limit: 10 });

		console.log(pagination);

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

