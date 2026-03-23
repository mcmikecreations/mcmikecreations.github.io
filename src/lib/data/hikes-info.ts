import hikes from '$lib/data/hikes.json';
import type { Map } from '$lib/data/map-info';

export interface ProcessedPost {
    year: number;
    month: number;
    day: number;
    date: Date;
    url: string;
    title: string;
    image?: string;
    description: string;
    tags: string[];
    people: string[] | null;
    anchor: string;
}

interface HikeParams {
    page?: number;
    tag?: string;
    year?: number;
    limit?: number;
}

export function getAllPosts(): ProcessedPost[] {
    const posts = (hikes as Map[]).flatMap(h => h.properties.dates
        .filter(d => !h.properties.draft && d.path)
        .map(d => {
            const date = new Date(d.date);
            const slug = h.route.substring(h.route.lastIndexOf('/') + 1);
            return {
                year: date.getFullYear(),
                month: date.getMonth() + 1,
                day: date.getDate(),
                date: date,
                url: `/hikes/${d.date}-${slug}/`,
                title: d.title ?? h.name,
                image: d.image ?? h.image?.replace('/hikes/', '/hikes/thumb/'),
                description: (d.description ? (d.description + ' ') : '') + h.description,
                tags: d.tags,
                people: d.people,
                anchor: `${d.date}-${slug}`
            };
        }));
    posts.sort((a, b) => a.date > b.date ? -1 : (a.date < b.date ? 1 : 0));
    return posts;
}

export function getPosts({ page = 1, tag, year, limit = 10 }: HikeParams) {
    let posts = getAllPosts();

    if (tag) {
        posts = posts.filter(p => p.tags.includes(tag));
    }

    if (year) {
        posts = posts.filter(p => p.year === year);
    }

    const totalPosts = posts.length;
    const totalPages = Math.ceil(totalPosts / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const visiblePosts = posts.slice(startIndex, endIndex);

    return {
        posts: visiblePosts,
        pagination: {
            currentPage: page,
            totalPages,
            totalPosts,
            hasNext: page < totalPages,
            hasPrev: page > 1,
            nextPage: page < totalPages ? page + 1 : null,
            prevPage: page > 1 ? page - 1 : null
        }
    };
}

