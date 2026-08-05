/**
 * Post-processes the sitemap that `svelte-sitemap` generates from `build/`.
 *
 * It works off each entry's prerendered HTML, so it needs no list of its own to
 * keep in sync:
 *
 *  - Drops redirect stubs. `adapter-static` renders every `redirect()` as a
 *    meta-refresh page, which has no business being advertised as a destination.
 *  - Drops `noindex` pages. Listing a page you have asked Google not to index is
 *    a contradiction, and Search Console reports it as one.
 *  - Adds `lastmod` for dated posts, whose URL carries the real publication date.
 *    Undated URLs get none, rather than a fabricated build timestamp.
 */

import { readFileSync, writeFileSync } from 'fs';

const sitemap = readFileSync('build/sitemap.xml', 'utf-8');
const domain = 'https://mykolamor.com';

/** `/hikes/2026-07-26-laubeneck/` -> `2026-07-26`. */
const DATED_POST = /^\/(?:hikes|blog)\/(\d{4}-\d{2}-\d{2})-[^/]+\/$/;

let dropped = 0;
let stamped = 0;

const filtered = sitemap.replace(/<url>[\s\S]*?<\/url>/g, (entry) => {
	const match = entry.match(/<loc>(.*?)<\/loc>/);
	if (!match) return entry;

	const path = decodeURIComponent(match[1].replace(domain, ''));
	const htmlPath = `build${path}index.html`;

	try {
		const html = readFileSync(htmlPath, 'utf-8');
		if (html.includes('http-equiv="refresh"') || html.includes("http-equiv='refresh'")) {
			dropped++;
			return '';
		}
		if (/<meta\s+name="robots"[^>]*noindex/i.test(html)) {
			dropped++;
			return '';
		}
	} catch {
		// no file, keep entry
	}

	const dated = path.match(DATED_POST);
	if (dated && !entry.includes('<lastmod>')) {
		stamped++;
		return entry.replace('</loc>', `</loc>\n    <lastmod>${dated[1]}</lastmod>`);
	}

	return entry;
});

writeFileSync('build/sitemap.xml', filtered);
console.log(`Sitemap filtered: dropped ${dropped}, dated ${stamped}.`);
