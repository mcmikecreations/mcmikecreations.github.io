import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import type { HttpError } from '@sveltejs/kit'
import maps from '$lib/data/maps.json';
import { providerFile, providerFolder, providers } from '$lib/data/map-providers';
import { geoMercator, geoPath } from 'd3-geo';
import { tile } from 'd3-tile';
import * as THREE from 'three';
import { SVGLoader } from 'three/addons/loaders/SVGLoader.js';
import type { GeometryData, Map, OriginData, TilesData } from '$lib/data/map-info';

export const load: PageLoad = async ({ fetch, params }) => {
	try {
		const meta : Map | undefined = maps.find((x) => x.route.endsWith(params.slug));

		if (!meta) {
			console.log(`Failed to fetch /maps/${params.slug} metadata.`);
			error(404, { message: `Failed to fetch "${params.slug}"` });
		}

		const origin = meta.features.find((x) => x.type === 'Origin');

		if (!origin) {
			console.log(`Failed to find origin for /maps/${params.slug}.`);
			error(404, { message: `Failed to find origin for "${params.slug}"` });
		}

		const height = meta.height;
		const originData : OriginData = origin.data as OriginData;

		const projection = geoMercator()
			.center([originData.lon, originData.lat])
			.scale(Math.pow(2, 21) / (2 * Math.PI))
			.translate([height / 2, height / 2]);

		const layers2d : Array<string> = [];
		const layers3d : Array<THREE.Object3D> = [];

		const loaderSVG = new SVGLoader();

		for (const layer of meta.features) {
			if (layer.type === 'Tiles') {
				const tileFunc = tile()
					.size([height, height])
					.scale(projection.scale() * 2 * Math.PI)
					.translate(projection([0, 0]));

				const layerData : TilesData = layer.data as TilesData;
				const tiles = tileFunc();
				const provider = providers[layerData?.provider ?? ''];
				const url = (x : number, y : number, z : number) => `/${providerFolder}/` + providerFile(x, y, z, provider.tileset, provider.format);

				if (layerData.modes.includes('2d')) {
					const images = tiles.map(([x, y, z] : Array<number>, i : number, {translate: [tx, ty], scale: k} : { translate: Array<number>, scale: number }) => `
						<image href="${url(x, y, z)}" x="${Math.round((x + tx) * k)}" y="${Math.round((y + ty) * k)}" width="${k}" height="${k}" />
					`);

					layers2d.push(`<g>${images.join('')}</g>`);
				}
				if (layerData.modes.includes('3d')) {
					const scale = tiles.scale;
					const segments = scale / 8;
					const geometry = new THREE.PlaneGeometry(scale, scale, segments, segments);
					const objects = tiles.map(([x, y, z] : Array<number>, i : number, {translate: [tx, ty], scale: k} : { translate: Array<number>, scale: number }) => {
						const imageUrl = url(x, y, z);
						const x3 = Math.round((x + tx) * k);
						const y3 = -Math.round((y + ty) * k);

						const plane = new THREE.Mesh(geometry);
						plane.position.set(x3, y3, 0);
						console.log(plane.position);
						// @ts-ignore
						plane.image = imageUrl;
						// @ts-ignore
						plane.imageProvider = layerData.provider;
						// @ts-ignore
						plane.imageMaps = layerData.maps;
						// @ts-ignore
						plane.imageCoordinates = [ x, y, z ];
						// @ts-ignore
						plane.imageScale = tileFunc.scale()();
						// @ts-ignore
						plane.imagePixels = k;
						return plane;
					});

					const group = new THREE.Group();
					group.add(...objects);
					layers3d.push(group);
				}
			}
			else if (layer.type === 'Geometry') {
				let geometry;
				const layerData : GeometryData = layer.data as GeometryData;
				if (layerData.path) {
					const jsonPathIndex = layerData.path.indexOf('#');
					const filePath = layerData.path.slice(0, jsonPathIndex);
					const file = await fetch(`/${providerFolder}/${layerData.provider}/${filePath}`);
					const text = await file.json();
					const jsonPath = layerData.path.slice(jsonPathIndex + 2) // We always have #/
						.split('/');
					geometry = jsonPath.reduce((prev, curr) => prev[curr], text);
				} else if (layerData.feature) {
					geometry = layerData.feature;
				} else {
					console.error('Wrong Geometry data:', layerData);
					continue;
				}

				if (layerData.modes.includes('2d')) {
					const path = geoPath(projection);
					layers2d.push(`<g><path fill="none" stroke="red" d="${path(geometry)}" /></g>`);
				}
				if (layerData.modes.includes('3d')) {
					const path = geoPath(projection);
					const svg = `<svg viewBox="0 0 ${height} ${height}" class="w-full aspect-square">
						<g><path fill="none" stroke="red" d="${path(geometry)}" /></g>
					</svg>`;
					/*const obj = loaderSVG.parse(svg);

					const group = new THREE.Group();

					for ( let i = 0; i < obj.paths.length; ++i) {
						const path = obj.paths[i];

						const material = new THREE.MeshBasicMaterial({
							color: path.color,
							side: THREE.DoubleSide,
							depthWrite: false
						});

						const shapes = SVGLoader.createShapes(path);

						for ( let j = 0; j < shapes.length; j ++ ) {
							const shape = shapes[ j ];
							const geometry = new THREE.ShapeGeometry(shape);
							const mesh = new THREE.Mesh(geometry, material);
							group.add(mesh);
						}
					}

					layers3d.push(group);*/
				}
			}
		}

		return {
			map: meta,
			origin: originData,
			projection: projection,
			data2d: layers2d.join(''),
			data3d: layers3d,
		};
	} catch (ex) {
		if ((ex as HttpError) !== undefined) {
			throw ex;
		} else {
			console.log(ex);
			error(500);
		}
	}
};