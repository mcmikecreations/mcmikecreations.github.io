import { getAllBlogPosts } from '$lib/blog/blog-info';
import { BLOG_TITLE, BLOG_DESCRIPTION } from '$lib/blog/blog-meta';
import resume from '$lib/data/resume.json';

export const prerender = true;

function escapeXml(s: string): string {
	return s.replace(/[<>&'"]/g, c => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' }[c] ?? c));
}

export function GET({ url }: { url: URL }) {
	const now = new Date();
	const posts = getAllBlogPosts().slice(0, 20);
	const { name, email } = resume.basics;

	const xml = `<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom" xmlns:media="http://search.yahoo.com/mrss/">
  <title>${escapeXml(BLOG_TITLE)}</title>
  <subtitle>${escapeXml(BLOG_DESCRIPTION)}</subtitle>
  <link href="${url.origin}/blog/atom.xml" rel="self" />
  <link href="${url.origin}/" />
  <id>${url.origin}/blog/</id>
  <updated>${now.toISOString()}</updated>
  <author>
    <name>${escapeXml(name)}</name>
    <email>${escapeXml(email)}</email>
    <uri>${url.origin}/resume/</uri>
  </author>
  <category term="technology"/>
  <contributor>
    <name>${escapeXml(name)}</name>
  </contributor>
  <icon>${url.origin}/favicon.png</icon>
${posts.map(p => `  <entry>
    <title>${escapeXml(p.title)}</title>
    <link rel="alternate" href="${url.origin}${p.url}" />
    <id>${url.origin}${p.url}</id>
    <updated>${p.date.toISOString()}</updated>
    <published>${p.date.toISOString()}</published>
    <summary>${escapeXml(p.description)}</summary>
    <rights type="html">&amp;copy; ${now.getFullYear()} ${escapeXml(name)}</rights>${p.image ? `
    <media:content url="${url.origin}${p.image}" medium="image" />` : ''}
  </entry>`).join('\n')}
</feed>`;

	return new Response(xml, { headers: { 'Content-Type': 'application/atom+xml' } });
}
