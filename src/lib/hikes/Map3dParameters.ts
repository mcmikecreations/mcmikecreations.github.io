import type { GeoProjection } from 'd3-geo';
import type { OriginData, Map } from '$lib/data/map-info';
import * as THREE from 'three';

export interface Map3dParameters {
	attrMapbox: boolean;
	attrOSM: boolean;
	origin: OriginData;
	projection: GeoProjection;
	map: Map;
	tileScale: number;
	pixelsPerMeter: number;
	data3d: THREE.Object3D[]
}
