import { providers } from './map-providers.js';

/**
 * Every hike uses the same map stack, so it is described here instead of being
 * repeated in `hikes.json`: OSM raster tiles in 2D, Mapbox Terrain-DEM in 3D
 * (textured with Mapbox Satellite), a single openrouteservice-derived GeoJSON
 * route, and elevation statistics built from that same route.
 */
const tiles2dProvider = 'osm';
const tiles3dProvider = 'mapboxDEM';
const tiles3dDiffuseProvider = 'mapboxSatellite';
const geometryProvider = 'hikes/geojson';
const geometrySource = 'https://maps.openrouteservice.org/';

/**
 * @param {{ standardFeatures: { origin: any }; properties: { filePath: string }; }} map
 */
export function getMapFeatures(map) {
	// The route is always the first feature of the hike's own GeoJSON file, which
	// `properties.filePath` already points at.
	const geometryData = {
		"provider": geometryProvider,
		"modes": [ "2d", "3d" ],
		"path": `${map.properties.filePath.substring(map.properties.filePath.lastIndexOf('/') + 1)}#/features/0`
	};

	return [
		{
			"type": "Origin",
			"source": providers[tiles2dProvider].source,
			"data": map.standardFeatures.origin
		},
		{
			"type": "Tiles",
			"source": providers[tiles2dProvider].source,
			"data": {
				"provider": tiles2dProvider,
				"modes": [ "2d" ]
			}
		},
		{
			"type": "Tiles",
			"source": providers[tiles3dProvider].source,
			"data": {
				"provider": tiles3dProvider,
				"modes": [ "3d" ],
				"maps": {
					"displacement": tiles3dProvider,
					"diffuse": tiles3dDiffuseProvider
				}
			}
		},
		{
			"type": "Geometry",
			"source": geometrySource,
			"data": geometryData
		},
		{
			"type": "Statistics",
			"source": geometrySource,
			"data": geometryData
		}
	];
}
