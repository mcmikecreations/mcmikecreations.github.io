import { geoMercator } from 'd3-geo';
import { tile } from 'd3-tile';
import maps from '../src/lib/data/maps.json' assert { type: "json" };
import { existsSync } from 'fs';
import { mkdir, writeFile } from 'fs/promises';
import { resolve } from 'path';
import { providers } from './map-providers.js';

// Load map based on name and mapbox key. E.g. node map-download.js seekarkreuz pk.eya79cwhrfa9we

const mapFolder = '../static/_projects/data-viz/maps';
const file = (x,y,z,type,format) => `${type}/${z}_${x}_${y}.${format}`;

const verifyFolder = async (path) => {
	if (!existsSync(path)) {
		await mkdir(path, { recursive: true });
	}
}

const downloadFile = async (address, fileName) => {
	const response = await fetch(address);
	const destination = resolve(mapFolder, fileName);
	const buffer = Buffer.from(await response.arrayBuffer());
	await writeFile(destination, buffer);

	return buffer.length;
};

const slug = process.argv[2];
const sku = process.argv[3];
const tokenMapboxDEM = process.argv[4];
const tokenNextzen = process.argv[5];
const meta = maps.find((x) => x.route.endsWith(slug));

if (!meta) {
	console.error(`Failed to fetch /maps/${slug} metadata.`);
}

const origin = meta.features.find((x) => x.type === 'origin');

if (!origin) {
	console.error(`Failed to find origin for /maps/${slug}.`);
}

const height = meta.height;
const projection = geoMercator()
	.center([origin.data.lon, origin.data.lat])
	.scale(Math.pow(2, 21) / (2 * Math.PI))
	.translate([height / 2, height / 2]);

const tileFunc = tile()
	.size([height, height])
	.scale(projection.scale() * 2 * Math.PI)
	.translate(projection([0, 0]));
const tiles = tileFunc();

await verifyFolder(resolve(mapFolder, `${providers.mapboxDEM.tileset}/`));
await verifyFolder(resolve(mapFolder, `${providers.nextzenTerrariumDEM.tileset}/`));
tiles.map(async ([x, y, z], i, {translate: [tx, ty], scale: k}) => {
	await downloadFile(
		providers.mapboxDEM.url(x, y, z, `sku=${sku}&access_token=${tokenMapboxDEM}`),
		file(x, y, z, providers.mapboxDEM.tileset, providers.mapboxDEM.format)
	);
	await downloadFile(
		providers.nextzenTerrariumDEM.url(x, y, z, `api_key=${tokenNextzen}`),
		file(x, y, z, providers.nextzenTerrariumDEM.tileset, providers.nextzenTerrariumDEM.format)
	);
});
