import { getAllPosts, getPosts } from '$lib/hikes/hikes-info';
import { error } from '@sveltejs/kit';

export const prerender = true;

export function entries() {
    const posts = getAllPosts();
    const tags = [...new Set(posts.flatMap(p => p.tags))];
    return tags.map(tag => ({ tag }));
}

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
