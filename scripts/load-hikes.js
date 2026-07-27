import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const hikesPath = path.join(__dirname, '../src/lib/data/hikes.json');
const sidecarDir = path.join(__dirname, '../static/_projects/data-viz/hikes/markdown');

/**
 * Node-side counterpart of `src/lib/data/hikes-db.ts`: read `hikes.json` and
 * fold each hike's `<slug>.hike.json` sidecar back in.
 */
export function loadHikes() {
	const routes = JSON.parse(fs.readFileSync(hikesPath, 'utf-8'));

	return routes.map((entry) => {
		const slug = entry.route.substring(entry.route.lastIndexOf('/') + 1);
		const file = path.join(sidecarDir, `${slug}.hike.json`);
		if (!fs.existsSync(file)) {
			throw new Error(`Missing sidecar ${slug}.hike.json for hike route "${entry.route}"`);
		}
		const { name, description, image, origin, height, checkpoints, nodes } =
			JSON.parse(fs.readFileSync(file, 'utf-8'));

		const properties = { ...entry.properties, checkpoints };
		if (nodes !== undefined) properties.nodes = nodes;

		return {
			name,
			image,
			properties,
			description,
			route: entry.route,
			height,
			standardFeatures: { origin }
		};
	});
}
