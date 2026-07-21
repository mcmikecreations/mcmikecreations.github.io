/**
 * Server-only front matter parsing for blog posts.
 */

import matter from 'gray-matter';

type Dict = Record<string, unknown>;

/**
 * Parse a blog markdown file, returning the raw front matter data and the body
 * with the front matter removed. Never throws: malformed YAML logs and yields an
 * empty object with the original text as the body.
 */
export function readBlogFrontmatter(raw: string): { data: Dict; content: string } {
	try {
		const parsed = matter(raw);
		return { data: (parsed.data ?? {}) as Dict, content: parsed.content };
	} catch (ex) {
		console.log('Failed to parse blog front matter:', ex);
		return { data: {}, content: raw };
	}
}
