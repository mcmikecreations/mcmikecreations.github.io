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
	features: Feature[];
	properties: MapProperties;
}

export type {
	MapProvider, Map, MapProperties, Feature, GeometryData, TilesData, TilesMapsData, OriginData, Mode
};