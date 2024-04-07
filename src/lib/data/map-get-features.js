import { providers } from './map-providers.js';

/**
 * @param {{ standardFeatures: any; features: any; }} map
 */
export function getMapFeatures(map) {
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
			// @ts-expect-error string can't be used to index type
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
			// @ts-expect-error string can't be used to index type
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
