/* eslint-disable @typescript-eslint/no-explicit-any,@typescript-eslint/ban-ts-comment */
import type { Feature, GeometryData, Map } from '$lib/data/map-info';
import { providerFolder } from '$lib/data/map-providers';
import { geoClipRectangle, geoPath, type GeoPermissibleObjects, type GeoProjection } from 'd3-geo';
import * as THREE from 'three';
import { MeshLineGeometry } from '$lib/hikes/meshline/MeshLineGeometry';
import { MeshLineMaterial } from '$lib/hikes/meshline/MeshLineMaterial';
import { ThreePathContext } from '$lib/hikes/ThreePathContext';
import { mergeMetrics } from '$lib/hikes/hike-metrics';

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
	const merged = mergeMetrics(properties, geometry?.properties);

	properties.distance = merged.distance;
	properties.duration = merged.duration;
	properties.ascent = merged.ascent;
	properties.descent = merged.descent;

	return properties;
}
export const primaryIndicatorColor = '#14b8a6';
export const secondaryIndicatorColor = '#b08080';
export const primaryGeometryColor = '#2dd4bf';
export const secondaryGeometryColor = '#ff0000';

export async function buildGeometry(
	fetch : (input: (RequestInfo | URL), init?: (RequestInit | undefined)) => Promise<Response>,
	layer : Feature,
	geometry : object,
	projection : GeoProjection,
	pixelsPerMeter : number,
	tiles: any,
	tileFunc : any
) {
	const result : {
		layers2d: Array<string>,
		layers3d: Array<THREE.Object3D>,
	} = {
		layers2d: [],
		layers3d: [],
	};

	const layerData : GeometryData = layer.data as GeometryData;

	if (layerData.modes.includes('2d')) {
		const path = geoPath(projection);
		result.layers2d.push(`<g><path fill="none" stroke-width="2" stroke="${secondaryGeometryColor}" d="${path(geometry as GeoPermissibleObjects)}" /></g>`);
	}
	if (layerData.modes.includes('3d')) {
		const tileScale = tiles.scale;
		const includeHelper = false;
		const useElevation = true;
		const objects = tiles.map((tile : Array<number>) => {
			const tileData = {
				x: (tile[0] + tiles.translate[0]) * tileScale,
				y: (tile[1] + tiles.translate[1]) * tileScale,
				scale: tileScale
			};
			const group = new THREE.Group();
			const context = new ThreePathContext({
				x: tileData.x,
				y: tileData.y,
				width: tileData.scale,
				height: tileData.scale
			});
			const polyCoords = [
				{ x: tileData.x, y: tileData.y },
				{ x: tileData.x, y: tileData.y + tileData.scale },
				{ x: tileData.x + tileData.scale, y: tileData.y + tileData.scale },
				{ x: tileData.x + tileData.scale, y: tileData.y },
			];
			projection.postclip(geoClipRectangle(
				polyCoords[0].x,
				polyCoords[0].y,
				polyCoords[2].x,
				polyCoords[2].y
			));
			const path = geoPath(projection, context);
			path(geometry as GeoPermissibleObjects);

			if (includeHelper) {
				const polyShape = new THREE.Shape(polyCoords.map((coord) => new THREE.Vector2(coord.x - tileScale * 0.5, -coord.y + tileScale * 0.5)))
				const polyGeometry = new THREE.ShapeGeometry(polyShape);
				const polygon = new THREE.Mesh(polyGeometry, new THREE.MeshBasicMaterial({ color: '#0000ff', side: THREE.DoubleSide}));
				group.add(polygon);
			}

			for (const p of context.paths) {
				const points2d = p.getPoints();
				// @ts-expect-error Erasing geometry type above
				const coordinates : Array<number>[] = geometry.coordinates ?? geometry.geometry?.coordinates ?? [];
				const points = !useElevation && points2d.length === coordinates.length
					? points2d.map((v, i) => new THREE.Vector3(
						v.x - tileScale * 0.5 - tileData.x,
						-v.y + tileScale * 0.5 + tileData.y,
						coordinates[i][2] * pixelsPerMeter))
					: points2d.map((v) => new THREE.Vector3(
						v.x - tileScale * 0.5 - tileData.x,
						-v.y + tileScale * 0.5 + tileData.y,
						0.0));

				const buffer = new MeshLineGeometry().setFromPoints( points );
				const material = new MeshLineMaterial({
					color: primaryGeometryColor,
					resolution: new THREE.Vector2(512, 512),
				});

				const line = new THREE.Mesh(buffer, material);
				line.position.set(tileData.x, -tileData.y, 0);
				line.renderOrder = 800;
				if (useElevation) {
					// @ts-ignore
					line.image = `/_projects/data-viz/maps/mapbox-terrain-dem-v1/${tile[2]}_${tile[0]}_${tile[1]}.png`;
					// @ts-ignore
					line.imageProvider = "mapboxDEM";
					// @ts-ignore
					line.imageMaps = { displacement: "mapboxDEM", diffuse: primaryGeometryColor };
					// @ts-ignore
					line.imageCoordinates = [ tile[0], tile[1], tile[2] ];
					// @ts-ignore
					line.imageScale = tileFunc.scale()();
					// @ts-ignore
					line.imagePixels = tileScale;
				}
				// @ts-ignore
				line.imageLayer = 'Geometry';
				group.add(line);
			}

			return group;
		});

		result.layers3d.push(...objects);
	}

	return result;
}
