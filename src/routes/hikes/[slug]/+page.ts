import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import type { HttpError } from '@sveltejs/kit'
import { type Feature, type GeometryData, getMapFeatures, type Map, type OriginData } from '$lib/data/map-info';
import hikes from '$lib/data/hikes.json';
import { readingTime } from 'reading-time-estimator';
import resume from '$lib/data/resume.json';
import { marked } from 'marked';
import { buildGeometry, loadGeometry, loadProperties } from '$lib/hikes/build-geometry';
import { buildStatistics } from '$lib/hikes/build-statistics';
import { geoMercator } from 'd3-geo';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
import { tile } from 'd3-tile';
import { buildTiles, getPixelsPerMeter } from '$lib/hikes/build-tiles';
import * as THREE from 'three';

export const load: PageLoad = async ({ fetch, params }) => {
	try {
		const slug = params.slug.endsWith('.html')
			? params.slug.substring(0, params.slug.length - '.hmtl'.length)
			: params.slug;
		// Get the post.
		const regex = /^(\d{4}-\d{2}-\d{2})-(.+)$/gm;
		let m: RegExpExecArray | null;

		do {
			m = regex.exec(slug);
			if (!m) break;

			const dateStr = m[1];
			const routeStr = m[2];
			const hike: Map | undefined =
				hikes.find(h => h.route.endsWith(routeStr + '/')) ??
				hikes.find(h => h.route.endsWith(routeStr));
			if (!hike) break;

			const date = hike.properties.dates.find(d => d.date === dateStr);
			if (!date || !date.path) break;

			let showStatistics = false;
			let showFilePrimary = false;
			const features: Feature[] | null = getMapFeatures(hike);
			const statistics = features?.find((x: Feature) => x.type === 'Statistics');
			const origin = features?.find((x: Feature) => x.type === 'Origin');
			const originData: OriginData | undefined =
				(origin?.data as OriginData | undefined) ??
				{ lat: 48.1401825, lon: 11.5584097 };
			const height = hike.height;
			const projection = geoMercator()
				.center([originData.lon, originData.lat])
				.scale(Math.pow(2, 21) / (2 * Math.PI))
				.translate([height / 2, height / 2]);
			const tileFunc = tile()
				.size([height, height])
				.scale(projection.scale() * 2 * Math.PI)
				.translate(projection([0, 0]));
			const tiles = tileFunc();
			const pixelsPerMeter = getPixelsPerMeter(originData.lat, tiles.scale, tileFunc.scale()());
			const layers2d : Array<string> = [];
			const layers3d : Array<THREE.Object3D> = [];
			const layersGeometry : Array<object> = [];
			const statisticsHeightPixels = height * 0.0625;
			const statisticsWidthPixels = height * 0.5;

			if (features && statistics) {
				let properties = hike.properties;
				for (const layer of features) {
					let data;
					if (layer.type === 'Tiles') {
						data = await buildTiles(fetch, layer, tiles, tileFunc);
					} else if (layer.type === 'Geometry') {
						const geometry = await loadGeometry(fetch, layer.data as GeometryData);
						layersGeometry.push(geometry);
						properties = loadProperties(hike, geometry);
						data = await buildGeometry(fetch, layer, geometry, projection, pixelsPerMeter, tiles, tileFunc);
						showStatistics = true;
						showFilePrimary = true;
					}

					if (data) {
						if (data.layers2d.length > 0) {
							layers2d.push(...data.layers2d);
						}
						if (data.layers3d.length > 0) {
							layers3d.push(...data.layers3d);
						}
					}
				}
				hike.properties = properties;
			}

			const gpx = await fetch(
				hike.properties.filePath.replace('geojson', 'gpx').replace('json', 'gpx'),
				{ method: 'OPTIONS' }
			);
			const showFileGpx = gpx.ok;

			const res = await fetch(date.path);
			if (!res.ok) {
				console.log(`Failed to fetch ${date.path} with return code ${res.status}.`);
				error(404, { message: `Failed to fetch "${slug}"` });
			}

			const post = await res.text();
			const headerRegex = /#{2} (.*)\r?\n/g;
			const headers = Array.from(post.matchAll(headerRegex), x => x[1]);
			const stats = readingTime(post);
			return {
				post: {
					title: date.title ?? hike.name,
					description: (date.description ? (date.description + ' ') : '') + hike.description,
					image: date.image ?? hike.image?.replace('/hikes/', '/hikes/thumb/'),
					content: marked.lexer(post),
					headers: headers,
					time: stats.text,
					date: dateStr,
					tags: date.tags,
					author: date.author ?? resume.basics.name,
					anchor: slug
				},
				map: hike,
				display: {
					statistics: showStatistics,
					filePrimary: showFilePrimary,
					fileGpx: showFileGpx,
				},
				mapDisplay: {
					origin: originData,
					features: features,
					statisticsSizePixels: [statisticsWidthPixels, statisticsHeightPixels],
					statistics: statistics
						? ((await buildStatistics(fetch, statistics, height, statisticsHeightPixels))?.layers2d?.join(''))
						: undefined,
					projection: projection,
					tileScale: tiles.scale,
					pixelsPerMeter: pixelsPerMeter,
					dataGeometry: layersGeometry,
					data2d: layers2d.join(''),
					data3d: layers3d
				}
			};
			// eslint-disable-next-line no-constant-condition
		} while (false);

		error(404);
	} catch (ex) {
		if ((ex as HttpError) !== undefined) {
			throw ex;
		} else {
			console.log(ex);
			error(500);
		}
	}
};