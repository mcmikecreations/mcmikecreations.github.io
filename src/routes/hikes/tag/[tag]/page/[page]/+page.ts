import { getPosts } from '$lib/data/hikes-info';
import { error } from '@sveltejs/kit';

export const prerender = false;

export function load({ params }) {
    const page = parseInt(params.page);
    const tag = decodeURIComponent(params.tag);
    if (isNaN(page) || page < 1) {
        throw error(404, 'Invalid page');
    }

    const { posts, pagination } = getPosts({ page, limit: 10, tag });

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

