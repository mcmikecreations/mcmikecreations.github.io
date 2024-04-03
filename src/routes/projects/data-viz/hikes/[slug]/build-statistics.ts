import type { Feature, GeometryData } from '$lib/data/map-info';
import { type GeoProjection } from 'd3-geo';
import * as THREE from 'three';
import { loadGeometry } from './build-geometry';

export async function buildStatistics(
	fetch : (input: (RequestInfo | URL), init?: (RequestInit | undefined)) => Promise<Response>,
	layer : Feature,
	projection : GeoProjection,
	height : number
) {
	const result : {
		layers2d: Array<string>,
		layers3d: Array<THREE.Object3D>,
	} = {
		layers2d: [],
		layers3d: [],
	};

	const layerData : GeometryData = layer.data as GeometryData;
	const geometry = await loadGeometry(fetch, layerData);

	if (layerData.modes.includes('2d')) {
		const points = geometry.geometry.coordinates;
		const [minHeight, maxHeight] = points.reduce(
			([minH, maxH] : Array<number>, curr: Array<number>) => [
				curr[2] < minH ? curr[2] : minH,
				curr[2] > maxH ? curr[2] : maxH
			],
			[points[0][2], points[0][2]]
		);
		const deltaHeight = minHeight === maxHeight ? 1.0 : maxHeight - minHeight;
		const containerSize = height * 0.5;
		const rectWidth = containerSize / points.length;
		const rectHeight = height * 0.125;
		const rectangles = points.map((x : Array<number>, i : number) : string =>
			`<rect width="${rectWidth}" height="${rectHeight}" x="${i * rectWidth}" fill="transparent" data-x="${x[0]}" data-y="${x[1]}" data-z="${x[2]}" data-h="${rectHeight - (x[2] - minHeight) / deltaHeight * rectHeight}" />`
		).join('');
		const paths = points.map((x : Array<number>, i : number) : string => `${i * rectWidth},${rectHeight - (x[2] - minHeight) / deltaHeight * rectHeight}`).join(' ');
		result.layers2d.push(`<g><path fill="none" stroke="red" d="M 0,${rectHeight - (points[0][2] - minHeight) / deltaHeight * rectHeight} L ${paths}" /></g>`);
		result.layers2d.push(`<g>${rectangles}</g>`);
		result.layers2d.push(`<g fill="var(--tw-prose-body)" class="text-[10px] align-middle"><text y="${rectHeight - 5}">${minHeight} m</text><text y="5">${maxHeight} m</text><text x=${containerSize} y="5" text-anchor="end" id="statsHeightIndicator"></text></g>`);
	}

	return result;
}
