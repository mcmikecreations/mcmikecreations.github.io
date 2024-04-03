import { providers } from '$lib/data/map-providers';

const Mode2d = '2d';
const Mode3d = '3d';
type Mode = typeof Mode2d | typeof Mode3d;

interface MapProvider {
	format: string;
	name: string;
	size: number;
	tileset: string;
	url: (x : number, y : number, z : number, params? : string) => string;
}

interface OriginData {
	lat: number;
	lon: number;
}

interface TilesMapsData {
	displacement?: string;
	diffuse?: string;
}

interface TilesData {
	provider: string;
	modes: Mode[];
	maps?: TilesMapsData;
}

interface GeometryData {
	provider: string;
	modes: string[];
	path?: string;
	feature?: object;
}

interface Feature {
	type: string;
	source: string;
	data: OriginData | TilesData | GeometryData;
}

interface StandardFeatures {
	origin: OriginData;
	tiles2d: string | null;
	tiles3d: string | null;
	geometry: GeometryData[] | null;
	geometrySource: string | string[] | null;
	statistics: boolean;
}

interface MapProperties {
	distance: number | null;
	duration: number | null;
	ascent: number | null;
	descent: number | null;
	dates: Array<string>;
	filePath: string;
	fileType: string;
}

interface Map {
	name: string;
	image?: string;
	description: string;
	route: string;
	height: number;
	standardFeatures: StandardFeatures | null;
	features: Feature[] | null;
	properties: MapProperties;
}

function getMapFeatures(map : Map) : Feature[] {
	if (!map.standardFeatures) {
		if (map.features) {
			return map.features;
		} else {
			return [];
		}
	}

	const std = map.standardFeatures;
	const result = [];

	result.push({
		"type": "Origin",
		"source": providers['osm'].source,
		"data": std.origin
	});

	if (std.tiles2d) {
		result.push({
			"type": "Tiles",
			// @ts-ignore
			"source": providers[std.tiles2d].source,
			"data": {
				"provider": std.tiles2d,
				"modes": [ "2d" ]
			}
		});
	}

	if (std.tiles3d) {
		result.push({
			"type": "Tiles",
			// @ts-ignore
			"source": providers[std.tiles3d].source,
			"data": {
				"provider": std.tiles3d,
				"modes": [ "3d" ],
				"maps": {
					"displacement": std.tiles3d,
					"diffuse": std.tiles3d === "mapboxDEM" ? "mapboxSatellite" : "osm"
				}
			}
		});
	}

	if (std.geometry) {
		for (const [i, geometryData] of std.geometry.entries()) {
			const source = std.geometrySource
				? typeof std.geometrySource === 'string'
					? std.geometrySource
					: std.geometrySource[i]
				: 'https://maps.openrouteservice.org/';
			result.push({
				"type": "Geometry",
				"source": source,
				"data": geometryData
			});
		}
	}

	if (std.geometry && std.geometry.length > 0 && std.statistics) {
		const source = std.geometrySource
			? typeof std.geometrySource === 'string'
				? std.geometrySource
				: std.geometrySource[0]
			: 'https://maps.openrouteservice.org/';
		result.push({
			"type": "Statistics",
			"source": source,
			"data": std.geometry[0]
		});
	}
	return result;
}

export type {
	MapProvider, Map, MapProperties, Feature, GeometryData, TilesData, TilesMapsData, OriginData, Mode
};
export {
	getMapFeatures
};
