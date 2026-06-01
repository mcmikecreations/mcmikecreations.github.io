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

	const xml = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:media="http://search.yahoo.com/mrss/">
<channel>
  <title>${escapeXml(BLOG_TITLE)}</title>
  <link>${url.origin}/blog/</link>
  <description>${escapeXml(BLOG_DESCRIPTION)}</description>
  <atom:link href="${url.origin}/blog/feed.xml" rel="self" type="application/rss+xml" />
  <language>en-us</language>
  <copyright>&amp;copy; ${now.getFullYear()} ${escapeXml(name)}</copyright>
  <managingEditor>${escapeXml(email)} (${escapeXml(name)})</managingEditor>
  <webMaster>${escapeXml(email)} (${escapeXml(name)})</webMaster>
  <pubDate>${now.toUTCString()}</pubDate>
  <lastBuildDate>${now.toUTCString()}</lastBuildDate>
  <category>Technology</category>
  <docs>https://www.rssboard.org/rss-specification</docs>
  <ttl>1440</ttl>
  <image>
    <url>${url.origin}/favicon.png</url>
    <title>${escapeXml(BLOG_TITLE)}</title>
    <link>${url.origin}/blog/</link>
  </image>
${posts.map(p => `  <item>
    <title>${escapeXml(p.title)}</title>
    <link>${url.origin}${p.url}</link>
    <description>${escapeXml(p.description)}</description>
    <pubDate>${p.date.toUTCString()}</pubDate>
    <guid>${url.origin}${p.url}</guid>
    <author>${escapeXml(email)} (${escapeXml(name)})</author>${p.image ? `
    <media:content url="${url.origin}${p.image}" medium="image" />` : ''}
  </item>`).join('\n')}
</channel>
</rss>`;

	return new Response(xml, { headers: { 'Content-Type': 'application/rss+xml' } });
}
