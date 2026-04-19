// noinspection JSUnusedLocalSymbols
import { geoMercator } from 'd3-geo';
import { tile } from 'd3-tile';
// noinspection ES6PreferShortImport
import maps from '../src/lib/data/hikes.json' with { type: "json" };
import { existsSync } from 'fs';
import { mkdir, writeFile } from 'fs/promises';
import { resolve } from 'path';
// noinspection ES6PreferShortImport
import { providers, providerFolder, providerFile } from '../src/lib/data/map-providers.js';
// noinspection ES6PreferShortImport
import { getMapFeatures } from '../src/lib/data/map-get-features.js';

// Load map based on name and mapbox key. E.g. node map-download.js seekarkreuz pk.eya79cwhrfa9we

const mapFolder = `../static/${providerFolder}/maps`;

const verifyFolder = async (path) => {
	if (!existsSync(path)) {
		await mkdir(path, { recursive: true });
	}
}

const downloadFile = async (address, fileName, requestInit = undefined) => {
	const destination = resolve(mapFolder, fileName);
	if (existsSync(destination)) return 0;
	
	// Wait a second between downloads to prevent rate-limiting
	await new Promise(resolve => setTimeout(resolve, 1000));
	
	//console.log(`Downloading ${address}`);
	const response = await fetch(address, requestInit);

	if (response.status === 429) {
		const interval = response.headers.get('X-Rate-Limit-Interval');
		const limit = response.headers.get('X-Rate-Limit-Limit');
		const reset = response.headers.get('X-Rate-Limit-Reset');

		console.error(`Rate Limit Exceeded (429)!`);
		console.error(`Interval: ${interval} seconds`);
		console.error(`Limit: ${limit} requests`);
		if (reset) {
			const resetDate = new Date(parseInt(reset, 10) * 1000); // Unix timestamp is in seconds
			console.error(`Reset: ${resetDate.toLocaleString('en-US', { timeZone: 'CET' })}`);
		}
		
		process.exit(1);
	}

	const buffer = Buffer.from(await response.arrayBuffer());
	if (!response.ok || buffer.length < 1024) {
		console.error(`Failed to download ${address}: ${response.status} ${response.statusText}`);
		return 0;
	}
	await writeFile(destination, buffer);

	return buffer.length;
};

const slug = process.argv.at(2);
const cookieMapycz = process.env.mapyczAccess;
const skuMapboxDEM = process.env.mapboxDEMSKU;
const tokenMapboxDEM = process.env.mapboxDEMAccess;
const skuMapboxSatellite = process.env.mapboxSatelliteSKU;
const tokenMapboxSatellite = process.env.mapboxSatelliteAccess;
const tokenNextzen = process.env.nextzenAccess;
const metas = slug === undefined
	? Object.values(maps)
	: [maps.find((x) => x.route.split('/').pop() === slug)];

if (!metas || metas.at(0) === undefined) {
	console.error(`Failed to fetch /maps/${slug} metadata.`);
}

for (const meta of metas) {
	await downloadMeta(meta);
}

async function downloadMeta(meta) {
	const features = getMapFeatures(meta);
	const origin = features.find((x) => x.type === 'Origin');

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
	await verifyFolder(resolve(mapFolder, `${providers.mapyOutdoor.tileset}/`));

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	for (const [x, y, z] of tiles) {
		//console.log(`Downloading ${z}/${x}/${y}`);
		let url = `${skuMapboxDEM}`.length > 0 ? `sku=${skuMapboxDEM}&access_token=${tokenMapboxDEM}` : `access_token=${tokenMapboxDEM}`;
		await downloadFile(
			providers.mapboxDEM.url(x, y, z, url),
			providerFile(x, y, z, providers.mapboxDEM.tileset, providers.mapboxDEM.format),
			{
				method: 'GET',
				headers: {
					"Origin": providers.mapboxDEM.origin,
					"Referrer": providers.mapboxDEM.origin,
				},
				referrer: providers.mapboxDEM.origin,
			}
		);
		url = `api_key=${tokenNextzen}`;
		await downloadFile(
			providers.nextzenTerrariumDEM.url(x, y, z, `api_key=${tokenNextzen}`),
			providerFile(x, y, z, providers.nextzenTerrariumDEM.tileset, providers.nextzenTerrariumDEM.format),
			undefined
		);
		await downloadFile(
			providers.osm.url(x, y, z),
			providerFile(x, y, z, providers.osm.tileset, providers.osm.format),
			undefined
		);
		url = `${skuMapboxSatellite}`.length > 0 ? `sku=${skuMapboxSatellite}&access_token=${tokenMapboxSatellite}` : `access_token=${tokenMapboxSatellite}`;
		await downloadFile(
			providers.mapboxSatellite.url(x, y, z, `sku=${skuMapboxSatellite}&access_token=${tokenMapboxSatellite}`),
			providerFile(x, y, z, providers.mapboxSatellite.tileset, providers.mapboxSatellite.format),
			{
				method: 'GET',
				headers: {
					"Origin": providers.mapboxDEM.origin,
					"Referrer": providers.mapboxDEM.origin,
				},
				referrer: providers.mapboxDEM.origin,
			}
		);
		await downloadFile(
			providers.mapyOutdoor.url(x, y, z),
			providerFile(x, y, z, providers.mapyOutdoor.tileset, providers.mapyOutdoor.format),
			{
				method: 'GET',
				headers: {
					"Origin": providers.mapyOutdoor.origin,
					"Referrer": providers.mapyOutdoor.origin,
					"Cookie": cookieMapycz
				},
				referrer: providers.mapyOutdoor.origin,
			}
		);
	}
}
