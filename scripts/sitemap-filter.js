import { readFileSync, writeFileSync } from 'fs';

const sitemap = readFileSync('build/sitemap.xml', 'utf-8');
const domain = 'https://mykolamor.com';

const filtered = sitemap.replace(
	/<url>[\s\S]*?<\/url>/g,
	(entry) => {
		const match = entry.match(/<loc>(.*?)<\/loc>/);
		if (!match) return entry;

		const path = match[1].replace(domain, '');
		const htmlPath = `build${path}index.html`;

		try {
			const html = readFileSync(htmlPath, 'utf-8');
			if (html.includes('http-equiv="refresh"') || html.includes("http-equiv='refresh'")) {
				return '';
			}
		} catch {
			// no file, keep entry
		}

		return entry;
	}
);

writeFileSync('build/sitemap.xml', filtered);
console.log('Sitemap filtered.');