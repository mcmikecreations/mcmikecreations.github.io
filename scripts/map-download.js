import { geoMercator } from 'd3-geo';
import { tile } from 'd3-tile';
import maps from '../src/lib/data/maps.json' assert { type: "json" };
import { existsSync } from 'fs';
import { mkdir, writeFile } from 'fs/promises';
import { resolve } from 'path';
import { providers, providerFolder, providerFile } from '../src/lib/data/map-providers.js';

// Load map based on name and mapbox key. E.g. node map-download.js seekarkreuz pk.eya79cwhrfa9we

const mapFolder = `../static/${providerFolder}`;

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
const skuMapboxDEM = process.env.mapboxDEMSKU;
const tokenMapboxDEM = process.env.mapboxDEMAccess;
const skuMapboxSatellite = process.env.mapboxSatelliteSKU;
const tokenMapboxSatellite = process.env.mapboxSatelliteAccess;
const tokenNextzen = process.env.nextzenAccess;
const meta = maps.find((x) => x.route.endsWith(slug));

if (!meta) {
	console.error(`Failed to fetch /maps/${slug} metadata.`);
}

const origin = meta.features.find((x) => x.type === 'Origin');

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
await verifyFolder(resolve(mapFolder, `${providers.mapboxSatellite.tileset}/`));
await verifyFolder(resolve(mapFolder, `${providers.nextzenTerrariumDEM.tileset}/`));
await verifyFolder(resolve(mapFolder, `${providers.osm.tileset}/`));
tiles.map(async ([x, y, z], i, {translate: [tx, ty], scale: k}) => {
	/*await downloadFile(
		providers.mapboxDEM.url(x, y, z, `sku=${skuMapboxDEM}&access_token=${tokenMapboxDEM}`),
		providerFile(x, y, z, providers.mapboxDEM.tileset, providers.mapboxDEM.format)
	);
	await downloadFile(
		providers.nextzenTerrariumDEM.url(x, y, z, `api_key=${tokenNextzen}`),
		providerFile(x, y, z, providers.nextzenTerrariumDEM.tileset, providers.nextzenTerrariumDEM.format)
	);
	await downloadFile(
		providers.osm.url(x, y, z),
		providerFile(x, y, z, providers.osm.tileset, providers.osm.format)
	);*/
	await downloadFile(
		providers.mapboxSatellite.url(x, y, z, `sku=${skuMapboxSatellite}&access_token=${tokenMapboxSatellite}`),
		providerFile(x, y, z, providers.mapboxSatellite.tileset, providers.mapboxSatellite.format)
	);
});
