/* eslint-disable @typescript-eslint/no-explicit-any,@typescript-eslint/ban-ts-comment */
import type { Feature, MapProvider, TilesData } from '$lib/data/map-info';
import { providerFile, providerFolder, providers } from '$lib/data/map-providers';
import * as THREE from 'three';

export function getPixelsPerMeter(lat : number, imagePixels : number, imageScale : number) {
	return (Math.cos((lat ?? 0.0) * Math.PI / 180) *
			2 * Math.PI * 6378137
		)
		/ (imagePixels * imageScale);
}

export async function buildTiles(
	fetch : (input: (RequestInfo | URL), init?: (RequestInit | undefined)) => Promise<Response>,
	layer : Feature,
	tiles : any,
	tileFunc : any
) {
	const result : {
		layers2d: Array<string>,
		layers3d: Array<THREE.Object3D>,
	} = {
		layers2d: [],
		layers3d: [],
	};

	const layerData : TilesData = layer.data as TilesData;
	// @ts-ignore
	const provider = (providers as unknown)[layerData?.provider ?? ''] as MapProvider;
	const url = (x : number, y : number, z : number) => `/${providerFolder}/` + providerFile(x, y, z, provider.tileset, provider.format);

	if (layerData.modes.includes('2d')) {
		// noinspection HtmlUnknownAttribute
		const images = tiles.map(([x, y, z] : Array<number>, i : number, {translate: [tx, ty], scale: k} : { translate: Array<number>, scale: number }) => `
						<image href="${url(x, y, z)}" x="${Math.round((x + tx) * k)}" y="${Math.round((y + ty) * k)}" width="${k}" height="${k}" />
					`);

		result.layers2d.push(`<g>${images.join('')}</g>`);
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
		result.layers3d.push(group);
	}

	return result;
}
