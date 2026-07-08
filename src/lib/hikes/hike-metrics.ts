/**
 * Shared, framework-free helpers for the four hike metrics
 * (distance, duration, ascent, descent).
 *
 * Canonical units used everywhere in the app:
 *   - distance : metres
 *   - duration : minutes
 *   - ascent   : metres
 *   - descent  : metres
 *
 * The GeoJSON source stores distance in km and duration in seconds, so those
 * are converted here. Any of the four may be overridden per-hike in
 * hikes.json under `properties`; an override always wins over the GeoJSON
 * value. Keep this the single place that encodes both the unit conversion and
 * the override precedence so the plots, stat cards, JSON-LD and the /hikes/tag/Web/
 * summary all agree.
 */

export interface HikeMetrics {
	distance: number | null; // metres
	duration: number | null; // minutes
	ascent: number | null; // metres
	descent: number | null; // metres
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type GeoProps = { summary?: { distance?: number; duration?: number }; ascent?: number; descent?: number } | null | undefined;

/**
 * Merge a hike's override properties with the GeoJSON feature properties,
 * returning the four metrics in canonical units. Override (non-null) wins;
 * otherwise the GeoJSON value is converted; otherwise null.
 */
export function mergeMetrics(override: Partial<HikeMetrics> | null | undefined, geo: GeoProps): HikeMetrics {
	const summary = geo?.summary;
	return {
		distance: override?.distance ?? (summary?.distance != null ? summary.distance * 1000 : null),
		duration: override?.duration ?? (summary?.duration != null ? summary.duration / 60 : null),
		ascent: override?.ascent ?? geo?.ascent ?? null,
		descent: override?.descent ?? geo?.descent ?? null
	};
}

export function haversineKm(c1: number[], c2: number[]): number {
	const R = 6371;
	const φ1 = (c1[1] * Math.PI) / 180;
	const φ2 = (c2[1] * Math.PI) / 180;
	const Δφ = ((c2[1] - c1[1]) * Math.PI) / 180;
	const Δλ = ((c2[0] - c1[0]) * Math.PI) / 180;
	const a = Math.sin(Δφ / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
	return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export interface MetricScales {
	/** multiply a coordinate-derived (haversine) distance by this to reach the authoritative distance */
	distanceFactor: number;
	/** multiply an elevation excursion above `minElevation` by this to reach the authoritative vertical scale */
	elevationFactor: number;
	/** lowest elevation in the track; kept fixed when rescaling elevation labels */
	minElevation: number;
}

/**
 * Compute the linear scale factors that map the raw GeoJSON coordinate track
 * onto the authoritative (possibly overridden) metrics.
 *
 * - `distanceFactor` stretches the haversine distance of the plotted track so
 *   its total matches the authoritative distance (the elevation chart's x-axis
 *   reads in the same distance as the stat card, whether or not overridden).
 * - `elevationFactor` compresses/expands the track's vertical excursions so its
 *   total vertical travel (ascent + descent) matches the authoritative totals,
 *   relative to the GeoJSON's *declared* ascent/descent baseline. A single
 *   linear factor cannot hit the ascent and descent targets separately, so the
 *   combined ascent+descent ratio is used. Applied to labels only (via
 *   {@link scaleElevation}); the plotted curve shape is left untouched.
 *
 * `authoritative` holds the override-merged metrics (canonical units).
 * `geoBaseline` holds the raw GeoJSON feature properties used as the un-overridden
 * reference — its declared ascent/descent are the elevation baseline so a hike
 * without an ascent/descent override is left exactly unchanged (factor 1). If the
 * GeoJSON declares no ascent/descent, the baseline falls back to the track's own
 * z-delta sum.
 */
export function computeMetricScales(
	coords: number[][],
	authoritative?: Partial<HikeMetrics> | null,
	geoBaseline?: GeoProps
): MetricScales {
	if (!coords?.length) {
		return { distanceFactor: 1, elevationFactor: 1, minElevation: 0 };
	}

	let haversineTotal = 0;
	let curveAscent = 0;
	let curveDescent = 0;
	let minElevation = coords[0][2] ?? 0;

	for (let i = 0; i < coords.length; i++) {
		const z = coords[i][2] ?? 0;
		if (z < minElevation) minElevation = z;
		if (i > 0) {
			haversineTotal += haversineKm(coords[i - 1], coords[i]);
			const dz = z - (coords[i - 1][2] ?? 0);
			if (dz > 0) curveAscent += dz;
			else curveDescent += -dz;
		}
	}

	const authDistanceKm = authoritative?.distance != null ? authoritative.distance / 1000 : null;
	const distanceFactor = authDistanceKm != null && haversineTotal > 0 ? authDistanceKm / haversineTotal : 1;

	const authVertical =
		authoritative?.ascent != null || authoritative?.descent != null
			? (authoritative?.ascent ?? 0) + (authoritative?.descent ?? 0)
			: null;
	// Baseline: the GeoJSON's declared ascent+descent, so an un-overridden hike
	// yields factor 1 exactly; fall back to the track's z-delta sum if absent.
	const baselineVertical =
		geoBaseline?.ascent != null || geoBaseline?.descent != null
			? (geoBaseline?.ascent ?? 0) + (geoBaseline?.descent ?? 0)
			: curveAscent + curveDescent;
	const elevationFactor = authVertical != null && baselineVertical > 0 ? authVertical / baselineVertical : 1;

	return { distanceFactor, elevationFactor, minElevation };
}

/** Map a raw elevation to its displayed value, keeping the minimum fixed. */
export function scaleElevation(elevation: number, minElevation: number, elevationFactor: number): number {
	return minElevation + (elevation - minElevation) * elevationFactor;
}
