import type { Feature, GeometryData, Map } from '$lib/data/map-info';
import { providerFolder } from '$lib/data/map-providers';
import { geoPath, type GeoPermissibleObjects, type GeoProjection } from 'd3-geo';
import * as THREE from 'three';

// noinspection JSUnusedGlobalSymbols
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

export async function loadGeometry(
	fetch : (input: (RequestInfo | URL), init?: (RequestInit | undefined)) => Promise<Response>,
	layerData : GeometryData
) {
	if (layerData.path) {
		const jsonPathIndex = layerData.path.indexOf('#');
		const filePath = layerData.path.slice(0, jsonPathIndex);
		const file = await fetch(`/${providerFolder}/${layerData.provider}/${filePath}`);
		const text = await file.json();
		const jsonPath = layerData.path.slice(jsonPathIndex + 2) // We always have #/
			.split('/');
		return jsonPath.reduce((prev, curr) => prev[curr], text);
	} else if (layerData.feature) {
		return layerData.feature;
	} else {
		console.error('Wrong Geometry data:', layerData);
		return undefined;
	}
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function loadProperties(map : Map, geometry : any) {
	const properties = map.properties;

	if (properties.distance == null) {
		properties.distance = geometry.properties?.summary?.distance
			? geometry.properties.summary.distance * 1000
			: null;
	}
	if (properties.duration == null) {
		properties.duration = geometry.properties?.summary?.duration
			? geometry.properties.summary.duration / 60
			: null;
	}
	if (properties.ascent == null) {
		properties.ascent = geometry.properties?.ascent
		  ? geometry.properties.ascent
			: null;
	}
	if (properties.descent == null) {
		properties.descent = geometry.properties?.descent
			? geometry.properties.descent
			: null;
	}

	return properties;
}

export async function buildGeometry(
	fetch : (input: (RequestInfo | URL), init?: (RequestInit | undefined)) => Promise<Response>,
	layer : Feature,
	geometry : object,
	projection : GeoProjection,
	pixelsPerMeter : number,
	tileScale : number
) {
	const result : {
		layers2d: Array<string>,
		layers3d: Array<THREE.Object3D>,
	} = {
		layers2d: [],
		layers3d: [],
	};

	const layerData : GeometryData = layer.data as GeometryData;
	const color = 'red';

	if (layerData.modes.includes('2d')) {
		const path = geoPath(projection);
		result.layers2d.push(`<g><path fill="none" stroke="${color}" d="${path(geometry as GeoPermissibleObjects)}" /></g>`);
	}
	if (layerData.modes.includes('3d')) {
		const group = new THREE.Group();
		const context = new ThreePathContext();
		const path = geoPath(projection, context);
		path(geometry as GeoPermissibleObjects);

		for (const p of context.paths) {
			const points2d = p.getPoints();
			// @ts-expect-error Erasing geometry type above
			const coordinates : Array<number>[] = geometry.coordinates ?? geometry.geometry?.coordinates ?? [];
			const points = points2d.length === coordinates.length
				? points2d.map((v, i) => new THREE.Vector3(
					v.x - tileScale * 0.5,
					-v.y + tileScale * 0.5,
					coordinates[i][2] * pixelsPerMeter))
				: points2d.map((v) => new THREE.Vector3(v.x - tileScale * 0.5, -v.y + tileScale * 0.5, 0.0));

			const buffer = new THREE.BufferGeometry().setFromPoints( points );
			const material = new THREE.LineBasicMaterial({
				color: color,
				depthTest: false,
			});

			const line = new THREE.Line(buffer, material);
			line.renderOrder = 800;
			group.add(line);
		}

		result.layers3d.push(group);
	}

	return result;
}
