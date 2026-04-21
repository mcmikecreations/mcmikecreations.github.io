import { getAllPosts } from '$lib/hikes/hikes-info';
import resume from '$lib/data/resume.json';

export const prerender = true;

function escapeXml(s: string): string {
	return s.replace(/[<>&'"]/g, c => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' }[c] ?? c));
}

export function GET({ url }) {
	const now = new Date();
	const posts = getAllPosts().slice(0, 20);
	const { name, email } = resume.basics;

	const xml = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:media="http://search.yahoo.com/mrss/">
<channel>
  <title>Hiking, Climbing, Via Ferrata &amp; Trail Maps | Personal Hike Experiences | ${escapeXml(name)}</title>
  <link>${url.origin}/hikes/</link>
  <description>The most thorough hike reviews on the web</description>
  <atom:link href="${url.origin}/hikes/feed.xml" rel="self" type="application/rss+xml" />
  <language>en-us</language>
  <copyright>&amp;copy; ${now.getFullYear()} ${escapeXml(name)}</copyright>
  <managingEditor>${escapeXml(email)} (${escapeXml(name)})</managingEditor>
  <webMaster>${escapeXml(email)} (${escapeXml(name)})</webMaster>
  <pubDate>${now.toUTCString()}</pubDate>
  <lastBuildDate>${now.toUTCString()}</lastBuildDate>
  <category>Sports</category>
  <docs>https://www.rssboard.org/rss-specification</docs>
  <ttl>1440</ttl>
  <image>
    <url>${url.origin}/favicon.png</url>
    <title>Hiking, Climbing, Via Ferrata &amp; Trail Maps | Personal Hike Experiences</title>
    <link>${url.origin}/hikes/</link>
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