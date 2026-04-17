import { getPosts } from '$lib/hikes/hikes-info';
import { error } from '@sveltejs/kit';

export const prerender = false;

export async function load({ params }) {
    const tag = decodeURIComponent(params.tag);
    const { posts, pagination } = getPosts({ page: 1, tag });

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
