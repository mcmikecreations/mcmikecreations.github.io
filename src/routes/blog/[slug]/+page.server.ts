import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { readingTime } from 'reading-time-estimator';
import { marked, type TokensList, type Token } from 'marked';
import { readBlogFrontmatter } from '$lib/blog/frontmatter.server';
import { getBlogPostMeta } from '$lib/blog/blog-posts.server';

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
		const fileName = `${slug}.md`;
		const meta = getBlogPostMeta(fileName);

		if (!meta || meta.draft) {
			error(404, { message: `Failed to fetch "${slug}"` });
		}

		const url = `/_blog/${fileName}`;
		const res = await fetch(url);
		if (!res.ok) {
			console.log(`Failed to fetch ${url} with return code ${res.status}.`);
			error(404, { message: `Failed to fetch "${slug}"` });
		}

		// `postBody` has the front matter fence removed so the header outline,
		// reading time, and rendered content ignore the metadata block.
		const { content: postBody } = readBlogFrontmatter(await res.text());

		// Find all headers.
		const headerRegex = /#{2} (.*)\r?\n/g;
		const headers = Array.from(postBody.matchAll(headerRegex), x => x[1]);
		const stats = readingTime(postBody);

		const content = marked.lexer(postBody);
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
				date: new Date(meta.date).toLocaleDateString('en-us', { year: 'numeric', month: 'short', day: 'numeric' }),
				isoDate: meta.date,
				tags: meta.tags,
				author: meta.author,
				anchor: slug
			},
		};
	} catch (ex) {
		console.log(ex);
		error(500);
	}
};
