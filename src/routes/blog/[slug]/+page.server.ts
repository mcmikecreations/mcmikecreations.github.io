import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import blogs from '$lib/data/blogs.json';
import { readingTime } from 'reading-time-estimator';
import { marked, type TokensList, type Token } from 'marked';

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
		// Get the post.
		const fileName = `${slug}.md`;
		
		const meta = blogs.find((x) => x.path === fileName);

		if (!meta) {
			console.log(`Failed to fetch ${fileName} metadata.`);
			error(404, { message: `Failed to fetch "${slug}"` });
		}

		const url = `/_blog/${fileName}`;
		const res = await fetch(url);

		if (!res.ok) {
			console.log(`Failed to fetch ${url} with return code ${res.status}.`);
			error(404, { message: `Failed to fetch "${slug}"` });
		}

		const post = await res.text();

		// Find all headers.
		const headerRegex = /#{2} (.*)\r?\n/g;
		const headers = Array.from(post.matchAll(headerRegex), x => x[1]);
		const stats = readingTime(post);

		const content = marked.lexer(post);
		cleanTokens(content);

		return {
			post: {
				title: meta.title,
				description: meta.description,
				image: meta.image,
				imageFull: meta.imageFull,
				content: content,
				headers: headers,
				time: stats.text,
				date: new Date(meta.date).toLocaleDateString('en-us', { year:"numeric", month:"short", day:"numeric"}),
				tags: meta.tags,
				author: meta.author,
			},
		};
	} catch (ex) {
		console.log(ex);
		error(500);
	}
};
