import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import matter from 'gray-matter';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const hikesPath = path.join(__dirname, '../src/lib/data/hikes.json');
const staticDir = path.join(__dirname, '../static');
const metaFolder = '/_projects/data-viz/hikes/markdown';
const geoFolder = '/_projects/data-viz/hikes/geojson';

const POST_FILE = /^(\d{4}-\d{2}-\d{2})-(.+)\.md$/;

/** Front-matter keys that belong to a date rather than the hike. */
const DATE_KEYS = new Set([
	'title', 'description', 'image', 'tags', 'people', 'author', 'gpx',
	'filePath', 'metaPath', 'distance', 'duration', 'ascent', 'descent'
]);

const readJson = (p) => JSON.parse(fs.readFileSync(p, 'utf-8'));

/** Fold a sidecar into a hike, in the key order `hikes.json` used to have. */
function assemble(route, properties, meta) {
	const props = { ...properties, checkpoints: meta.checkpoints };
	if (meta.nodes === undefined) delete props.nodes;
	else props.nodes = meta.nodes;

	return {
		name: meta.name,
		image: meta.image,
		properties: props,
		description: meta.description,
		route,
		height: meta.height,
		standardFeatures: { origin: meta.origin }
	};
}

/**
 * Node-side counterpart of `src/lib/hikes/hikes.server.ts`: assemble every hike
 * from its sidecar, its posts' front matter, and whatever `hikes.json` still
 * holds. Yields the same shape the single file used to have.
 */
export function loadHikes() {
	const mdDir = path.join(staticDir, metaFolder);
	const files = fs.readdirSync(mdDir);

	const slugs = files
		.filter((f) => f.endsWith('.hike.json'))
		.map((f) => f.replace(/\.hike\.json$/, ''))
		.sort();

	const postsBySlug = {};
	for (const file of files.filter((f) => f.endsWith('.md'))) {
		const match = POST_FILE.exec(file);
		if (!match) throw new Error(`Hike post "${file}" is not named <date>-<slug>.md`);
		const [, date, slug] = match;
		const { data } = matter(fs.readFileSync(path.join(mdDir, file), 'utf-8'));
		const fields = {};
		for (const [k, v] of Object.entries(data ?? {})) {
			if (v !== null && v !== undefined && DATE_KEYS.has(k)) fields[k] = v;
		}
		(postsBySlug[slug] ??= []).push({
			date,
			path: `${metaFolder}/${file}`,
			tags: [],
			people: [],
			...fields
		});
	}

	const overrideBySlug = {};
	for (const entry of readJson(hikesPath)) {
		overrideBySlug[entry.route.substring(entry.route.lastIndexOf('/') + 1)] = entry.properties;
	}

	return slugs
		.map((slug) => {
			const props = overrideBySlug[slug] ?? {};
			const metaPath = props.metaPath ?? `${metaFolder}/${slug}.hike.json`;
			const metaFile = path.join(staticDir, metaPath);
			if (!fs.existsSync(metaFile)) {
				throw new Error(`Missing sidecar "${metaPath}" for hike "${slug}"`);
			}

			const dates = [
				...(postsBySlug[slug] ?? []),
				...(props.dates ?? []).map((d) => ({ ...d, tags: d.tags ?? [], people: d.people ?? [] }))
			].sort((a, b) => (a.date > b.date ? -1 : a.date < b.date ? 1 : 0));
			if (dates.length === 0) {
				throw new Error(`Hike "${slug}" has no dates: no post, and none in hikes.json`);
			}

			const properties = {
				...props,
				filePath: props.filePath ?? `${geoFolder}/${slug}.json`,
				draft: props.draft ?? false,
				dates
			};
			return assemble(`/projects/data-viz/hikes/${slug}`, properties, readJson(metaFile));
		})
		.sort((a, b) => {
			const da = a.properties.dates[0].date;
			const db = b.properties.dates[0].date;
			if (da !== db) return da > db ? -1 : 1;
			return a.route < b.route ? -1 : 1;
		});
}

/**
 * The hike as one of its dates sees it — the date's `metaPath` sidecar swapped
 * in and its `filePath` / metric overrides promoted. A post's date-level front
 * matter is already folded in by `loadHikes`.
 */
export function resolveHikeForDate(hike, date) {
	let base = hike;

	if (date.metaPath) {
		const metaFile = path.join(staticDir, date.metaPath);
		if (!fs.existsSync(metaFile)) {
			throw new Error(
				`Unknown sidecar "${date.metaPath}" on date ${date.date} of hike route "${hike.route}"`
			);
		}
		base = assemble(hike.route, hike.properties, readJson(metaFile));
	}

	const properties = { ...base.properties };
	if (date.filePath) properties.filePath = date.filePath;
	for (const key of ['distance', 'duration', 'ascent', 'descent']) {
		if (date[key] != null) properties[key] = date[key];
	}

	return { ...base, properties };
}
