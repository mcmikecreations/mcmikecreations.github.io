import { error } from '@sveltejs/kit';
import hikes from '$lib/data/hikes.json';
import { readingTime } from 'reading-time-estimator';
import resume from '$lib/data/resume.json';
import { marked, type TokensList, type Token } from 'marked';
import { defaultPageSize, getAllPosts } from '$lib/data/hikes-info';
import type { PageServerLoad } from './$types';

function cleanTokens(tokens: Token[] | TokensList | undefined) {
	if (!tokens) return;
	for (const t of tokens) {
		delete (t as any).raw;
		if ((t as any).tokens) cleanTokens((t as any).tokens);
		if ((t as any).items) cleanTokens((t as any).items);
	}
}

export const load: PageServerLoad = async ({ fetch, params }) => {
	try {
		const slug = params.slug.endsWith('.html')
			? params.slug.substring(0, params.slug.length - '.hmtl'.length)
			: params.slug;
		const regex = /^(\d{4}-\d{2}-\d{2})-(.+)$/gm;
		const m = regex.exec(slug);
		if (!m) {
			error(404, { message: `Failed to match slug "${slug}"` });
		}
		const dateStr = m[1];
		const routeStr = m[2];
		const hike =
			hikes.find(h => h.route.endsWith(routeStr + '/')) ??
			hikes.find(h => h.route.endsWith(routeStr));
		if (!hike) {
			error(404, { message: `Failed to find route "${routeStr}"` });
		}
		const date = hike.properties.dates.find(d => d.date === dateStr);
		if (!date || !date.path) {
			error(404, { message: `Failed to find date "${dateStr}"` });
		}
		
		const res = await fetch(date.path);
		if (!res.ok) {
			console.log(`Failed to fetch ${date.path} with return code ${res.status}.`);
			error(404, { message: `Failed to fetch "${slug}"` });
		}
		
		const postRaw = await res.text();
		
		const headerRegex = /#{2} (.*)\r?\n/g;
		const headers = Array.from(postRaw.matchAll(headerRegex), x => x[1]);
		const stats = readingTime(postRaw);
		const allPosts = getAllPosts();
		const postIndex = allPosts.findIndex(p => p.anchor === slug);
		const page = postIndex !== -1 ? Math.floor(postIndex / defaultPageSize) + 1 : 1;

		const content = marked.lexer(postRaw);
		cleanTokens(content);

		return {
			post: {
				title: date.title ?? hike.name,
				description: (date.description ? (date.description + ' ') : '') + hike.description,
				image: date.image?.replace('/hikes/', '/hikes/thumb/') ?? hike.image?.replace('/hikes/', '/hikes/thumb/'),
				imageFull: date.image ?? hike.image,
				content: content,
				headers: headers,
				time: stats.text,
				date: dateStr,
				tags: date.tags,
				author: date.author ?? resume.basics.name,
				anchor: slug ?? '',
				page,
			}
		};
	} catch (ex) {
		console.log(ex);
		error(500);
	}
};
