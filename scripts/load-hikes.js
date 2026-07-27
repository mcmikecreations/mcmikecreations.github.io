import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const hikesPath = path.join(__dirname, '../src/lib/data/hikes.json');
const staticDir = path.join(__dirname, '../static');
const metaFolder = '/_projects/data-viz/hikes/markdown';

/** The sidecar at a served path, e.g. `${metaFolder}/laubeneck.hike.json`. */
function readMeta(metaPath) {
	const file = path.join(staticDir, metaPath);
	if (!fs.existsSync(file)) return undefined;
	return JSON.parse(fs.readFileSync(file, 'utf-8'));
}

/** Fold a sidecar into a hike entry, in the key order `hikes.json` used to have. */
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
 * Node-side counterpart of `src/lib/data/hikes-db.ts`: read `hikes.json` and
 * fold each hike's `<slug>.hike.json` sidecar back in, yielding the entries in
 * the shape the single file used to have. Honours `properties.metaPath`.
 */
export function loadHikes() {
	const routes = JSON.parse(fs.readFileSync(hikesPath, 'utf-8'));

	return routes.map((entry) => {
		const slug = entry.route.substring(entry.route.lastIndexOf('/') + 1);
		const metaPath = entry.properties.metaPath ?? `${metaFolder}/${slug}.hike.json`;
		const meta = readMeta(metaPath);
		if (!meta) {
			throw new Error(`Missing sidecar "${metaPath}" for hike route "${entry.route}"`);
		}
		return assemble(entry.route, entry.properties, meta);
	});
}

/**
 * The hike as one of its dates sees it — the date's `metaPath` sidecar swapped in
 * and its `filePath` / metric overrides promoted. Mirrors `resolveHikeForDate`.
 */
export function resolveHikeForDate(hike, date) {
	let base = hike;

	if (date.metaPath) {
		const meta = readMeta(date.metaPath);
		if (!meta) {
			throw new Error(
				`Unknown sidecar "${date.metaPath}" on date ${date.date} of hike route "${hike.route}"`
			);
		}
		base = assemble(hike.route, hike.properties, meta);
	}

	const properties = { ...base.properties };
	if (date.filePath) properties.filePath = date.filePath;
	for (const key of ['distance', 'duration', 'ascent', 'descent']) {
		if (date[key] != null) properties[key] = date[key];
	}

	return { ...base, properties };
}
