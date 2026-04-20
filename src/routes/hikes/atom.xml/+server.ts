import { getAllPosts } from '$lib/hikes/hikes-info';
import resume from '$lib/data/resume.json';

export const prerender = true;

function escapeXml(s: string): string {
	return s.replace(/[<>&'"]/g, c => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' }[c] ?? c));
}

export function GET() {
	const now = new Date();
	const posts = getAllPosts().slice(0, 20);
	const { name, email } = resume.basics;

	const xml = `<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom" xmlns:media="http://search.yahoo.com/mrss/">
  <title>Hiking, Climbing, Via Ferrata &amp; Trail Maps | Personal Hike Experiences</title>
  <subtitle>The most thorough hike reviews on the web</subtitle>
  <link href="https://mykolamor.com/hikes/atom.xml" rel="self" />
  <link href="https://mykolamor.com/" />
  <id>https://mykolamor.com/hikes/</id>
  <updated>${now.toISOString()}</updated>
  <author>
    <name>${escapeXml(name)}</name>
    <email>${escapeXml(email)}</email>
    <uri>https://mykolamor.com/resume/</uri>
  </author>
  <category term="sports"/>
  <contributor>
    <name>${escapeXml(name)}</name>
  </contributor>
  <icon>https://mykolamor.com/favicon.png</icon>
${posts.map(p => `  <entry>
    <title>${escapeXml(p.title)}</title>
    <link rel="alternate" href="https://mykolamor.com${p.url}" />
    <id>https://mykolamor.com${p.url}</id>
    <updated>${p.date.toISOString()}</updated>
    <published>${p.date.toISOString()}</published>
    <summary>${escapeXml(p.description)}</summary>
    <rights type="html">&amp;copy; ${now.getFullYear()} ${escapeXml(name)}</rights>${p.image ? `
		<media:content url="https://mykolamor.com${p.image}" medium="image" />` : ''}
  </entry>`).join('\n')}
</feed>`;

	return new Response(xml, { headers: { 'Content-Type': 'application/atom+xml' } });
}