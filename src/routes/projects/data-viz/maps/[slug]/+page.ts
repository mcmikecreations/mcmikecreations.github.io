/* eslint-disable @typescript-eslint/ban-ts-comment */
import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import type { HttpError } from '@sveltejs/kit'
import maps from '$lib/data/maps.json';
import { providerFile, providerFolder, providers } from '$lib/data/map-providers';
import { geoMercator, geoPath } from 'd3-geo';
// @ts-ignore
import { tile } from 'd3-tile';
import * as THREE from 'three';
import type { GeometryData, Map, MapProvider, OriginData, TilesData } from '$lib/data/map-info';

class ThreePathContext {
	paths: THREE.Path[];
	currentPath?: THREE.Path;

	constructor() {
		this.paths = [];
	}

	initPath() {
		if (this.currentPath === undefined) {
			this.currentPath = new THREE.Path();
			this.paths.push(this.currentPath);
		}
	}
	arc(x: number, y: number, radius: number, startAngle: number, endAngle: number, anticlockwise?: boolean): void {
		this.initPath();
		// Since we flip y, we keep anticlockwise.
		this.currentPath?.arc(x, y, radius, startAngle, endAngle, !(anticlockwise ?? false));
	}

	beginPath(): void {
		this.initPath();
	}

	closePath(): void {
		this.currentPath = undefined;
	}

	lineTo(x: number, y: number): void {
		this.initPath();
		this.currentPath?.lineTo(x, y);
	}

	moveTo(x: number, y: number): void {
		this.initPath();
		this.currentPath?.moveTo(x, y);
	}
}

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

		const center = projection([originData.lon, originData.lat])!;
		const tileFunc = tile()
			.size([height, height])
			.scale(projection.scale() * 2 * Math.PI)
			.translate(projection([0, 0]));
		const tiles = tileFunc();
		const pixelsPerMeter = (Math.cos((originData.lat ?? 0.0) * Math.PI / 180) *
				2 * Math.PI * 6378137
			)
			/ (tiles.scale * tileFunc.scale()());

		const layers2d : Array<string> = [];
		const layers3d : Array<THREE.Object3D> = [];

		for (const layer of meta.features) {
			if (layer.type === 'Tiles') {

				const layerData : TilesData = layer.data as TilesData;
				// @ts-ignore
				const provider = (providers as unknown)[layerData?.provider ?? ''] as MapProvider;
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
					const group = new THREE.Group();
					const context = new ThreePathContext();
					const path = geoPath(projection, context);
					path(geometry);

					for (const p of context.paths) {
						const points2d = p.getPoints();
						const coordinates : Array<number>[] = geometry.coordinates ?? geometry.geometry?.coordinates ?? [];
						const points = points2d.length === coordinates.length
							? points2d.map((v, i) => new THREE.Vector3(
								v.x - center[0] * 0.5,
								-v.y + center[1] * 0.5,
								coordinates[i][2] * pixelsPerMeter + 1.0))
							: points2d.map((v) => new THREE.Vector3(v.x - center[0] * 0.5, -v.y + center[1] * 0.5, 0.0));

						const buffer = new THREE.BufferGeometry().setFromPoints( points );
						const material = new THREE.LineBasicMaterial({
							color: 'red',
							depthTest: false,
						});

						const line = new THREE.Line( buffer, material );
						line.renderOrder = 999;
						group.add(line);
					}

					layers3d.push(group);
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