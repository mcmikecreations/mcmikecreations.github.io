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
		const decoder = new TextDecoder("utf-8");
		console.error(`Failed to download ${address}: ${response.status} ${response.statusText}`, decoder.decode(buffer));
		return 0;
	}
	await writeFile(destination, buffer);

	return buffer.length;
};

const slug = process.argv.at(2);

// mapy.com serves tiles from a CloudFront distribution guarded by signed cookies.
// The browser obtains them by (1) loading the site to get a `User-Id` session cookie,
// then (2) calling `/refreshCookies`, which returns the CloudFront-* cookies (valid ~1h).
// We replicate that handshake so no manual cookie copying is needed. The result is
// cached and transparently refreshed shortly before it expires.
const mapyUserAgent = "Mozilla/5.0 (X11; Linux x86_64; rv:120.0) Gecko/20100101 Firefox/120.0";
let mapyCookie = null;
let mapyCookieExpiry = 0;

const parseSetCookies = (setCookies, jar) => {
	for (const header of setCookies) {
		const pair = header.split(';', 1)[0];
		const eq = pair.indexOf('=');
		if (eq < 0) continue;
		jar[pair.slice(0, eq).trim()] = pair.slice(eq + 1).trim();
	}
};

const getMapyCookie = async () => {
	const now = Math.floor(Date.now() / 1000);
	// Refresh a bit early (5 min) so long download runs never hit an expired cookie.
	if (mapyCookie && now < mapyCookieExpiry - 300) return mapyCookie;

	const jar = {};

	// 1. Bootstrap a session to receive the `User-Id` cookie.
	const home = await fetch("https://mapy.com/en/", {
		headers: { "User-Agent": mapyUserAgent },
	});
	if (!home.ok) {
		throw new Error(`mapy.com session bootstrap failed: ${home.status} ${home.statusText}`);
	}
	parseSetCookies(home.headers.getSetCookie(), jar);

	// 2. Exchange the session for CloudFront signed cookies.
	const cookieHeader = Object.entries(jar).map(([k, v]) => `${k}=${v}`).join('; ');
	const refresh = await fetch("https://mapy.com/refreshCookies", {
		headers: {
			"User-Agent": mapyUserAgent,
			"Cookie": cookieHeader,
			"Referer": "https://mapy.com/en/turisticka",
		},
	});
	if (!refresh.ok) {
		throw new Error(`mapy.com refreshCookies failed: ${refresh.status} ${refresh.statusText}`);
	}
	const data = await refresh.json();
	for (const { cname, value } of data.cookies ?? []) {
		jar[cname] = value;
	}

	mapyCookieExpiry = data.expiration ?? (now + (data.lifetime ?? 3600));
	mapyCookie = Object.entries(jar).map(([k, v]) => `${k}=${v}`).join('; ');
	console.log(`Fetched mapy.com cookies (valid until ${new Date(mapyCookieExpiry * 1000).toLocaleString('en-US', { timeZone: 'CET' })}).`);
	return mapyCookie;
};
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
					"Referrer": providers.mapyOutdoor.origin + '/',
					"Cookie": await getMapyCookie(),
					"Accept": "image/avif,image/webp,image/png,image/svg+xml,image/*;q=0.8,*/*;q=0.5",
					"Priority": "u=5, i",
					"Sec-Fetch-Dest": "image",
					"Sec-Fetch-Mode": "cors",
					"Sec-Fetch-Site": "same-site",
					"Sec-GPC": "1",
					"TE": "trailers"
				},
				referrer: providers.mapyOutdoor.origin + '/',
			}
		);
	}
}
