import { getMapFeatures } from '$lib/data/map-get-features';

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

interface MapDate {
	date: string;
	title?: string | undefined | null;
	description?: string | undefined | null;
	tags: string[];
	image?: string | undefined | null;
	path?: string | undefined | null;
	author?: string | undefined | null;
}

interface MapProperties {
	distance: number | null;
	duration: number | null;
	ascent: number | null;
	descent: number | null;
	dates: Array<MapDate>;
	filePath: string;
	fileType: string;
	draft: boolean | null;
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

export type {
	MapProvider, Map, MapProperties, Feature, GeometryData, TilesData, TilesMapsData, OriginData, Mode
};
export {
	getMapFeatures
};
