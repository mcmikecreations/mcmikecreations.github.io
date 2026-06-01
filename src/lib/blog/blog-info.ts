import blogs from '$lib/data/blogs.json';

export interface ProcessedBlogPost {
	year: number;
	month: number;
	day: number;
	date: Date;
	url: string;
	title: string;
	image?: string | null;
	description: string;
	tags: string[];
	anchor: string;
}

interface BlogParams {
	page?: number;
	tag?: string;
	year?: number;
	limit?: number;
}

export function getAllBlogPosts(): ProcessedBlogPost[] {
	const posts = (blogs as { title: string; date: string; image?: string | null; description?: string; path: string; tags: string[] }[]).map(k => {
		const date = new Date(k.date);
		const anchor = k.path.substring(0, k.path.length - 3);
		return {
			year: date.getFullYear(),
			month: date.getMonth() + 1,
			day: date.getDate(),
			date,
			url: `/blog/${anchor}/`,
			title: k.title,
			image: k.image ?? null,
			description: k.description ?? '',
			tags: k.tags,
			anchor,
		};
	});
	posts.sort((a, b) => (a.date > b.date ? -1 : a.date < b.date ? 1 : 0));
	return posts;
}

export const defaultPageSize = 10;

export function getBlogPosts({ page = 1, tag, year, limit = defaultPageSize }: BlogParams) {
	let posts = getAllBlogPosts();

	if (tag) {
		posts = posts.filter(p => p.tags.includes(tag));
	}

	if (year) {
		posts = posts.filter(p => p.year === year);
	}

	const totalPosts = posts.length;
	const totalPages = Math.max(1, Math.ceil(totalPosts / limit));
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
			prevPage: page > 1 ? page - 1 : null,
		},
	};
}
