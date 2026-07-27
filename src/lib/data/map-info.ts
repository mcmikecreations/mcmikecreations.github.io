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

/**
 * Per-hike map inputs. Everything else about the map stack (tile providers,
 * geometry provider and source, statistics) is identical for every hike and
 * lives in `map-get-features`.
 */
interface StandardFeatures {
	origin: OriginData;
}

interface MapNode {
	id: number;
	lat: number;
	lon: number;
	tags: {
		[key: string]: string | null | undefined;
	};
}

interface MapDate {
	date: string;
	title?: string | undefined | null;
	description?: string | undefined | null;
	tags: string[];
	people: string[] | null;
	image?: string | undefined | null;
	path?: string | undefined | null;
	gpx?: string | undefined | null;
	author?: string | undefined | null;
}

interface MapProperties {
	distance: number | null;
	duration: number | null;
	ascent: number | null;
	descent: number | null;
	dates: Array<MapDate>;
	filePath: string;
	draft: boolean | null;
	hidden?: boolean | undefined;
	/** Coarse `[lon, lat]` outline of the route, drawn by the Web graph. */
	checkpoints?: Array<[number, number]> | undefined;
	nodes?: MapNode[] | undefined | null;
}

/**
 * The hand-authored half of a hike, stored per slug in
 * `static/_projects/data-viz/hikes/markdown/<slug>.hike.json`. None of it is
 * derivable from the route GeoJSON or from a post's front matter, so it lives
 * beside the markdown rather than in `hikes.json`. See `hikes-db`.
 */
interface HikeMeta {
	name: string;
	description: string;
	image: string;
	/** Hand-picked map centre, unique per hike. */
	origin: OriginData;
	/** Hand-tuned render size of the map in pixels. */
	height: number;
	checkpoints: Array<[number, number]>;
	nodes?: MapNode[];
}

interface Map {
	name: string;
	image: string;
	description: string;
	route: string;
	height: number;
	standardFeatures: StandardFeatures;
	properties: MapProperties;
}

export type {
	MapProvider, Map, MapProperties, MapNode, HikeMeta, Feature, GeometryData, TilesData, TilesMapsData, OriginData, Mode, MapDate
};
export {
	getMapFeatures
};
