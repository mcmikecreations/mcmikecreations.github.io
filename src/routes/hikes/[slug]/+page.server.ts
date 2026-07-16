import { error } from '@sveltejs/kit';
import hikes from '$lib/data/hikes.json';
import { readingTime } from 'reading-time-estimator';
import resume from '$lib/data/resume.json';
import { defaultPageSize, getAllPosts, parseMarkdown } from '$lib/hikes/hikes-info';
import type { PageServerLoad } from './$types';
import type { Map, MapDate, MapProperties } from '$lib/data/map-info';
import { mergeMetrics } from '$lib/hikes/hike-metrics';
import { applyHikeOverrides, readHikeFrontmatter } from '$lib/hikes/frontmatter.server';
import { readHikeContacts } from '$lib/hikes/frontmatter';
import { buildHikeContacts } from '$lib/hikes/contacts';
import contactsBook from '$lib/data/contacts.json';

export const load: PageServerLoad = async ({ fetch, params, locals }) => {
	try {
		const slug = params.slug.endsWith('.html')
			? params.slug.substring(0, params.slug.length - '.hmtl'.length)
			: params.slug;
		const regex = /^(\d{4}-\d{2}-\d{2})-(.+)$/gm;
		const m = regex.exec(slug);
		if (!m) {
			error(404, { message: `Failed to match slug "${slug}"` });
		}
		const dateStr = m[1];
		const routeStr = m[2];
		const hike =
			hikes.find(h => h.route.split('/').pop() === routeStr);
		if (!hike) {
			error(404, { message: `Failed to find route "${routeStr}"` });
		}
		const date = hike.properties.dates.find(d => d.date === dateStr) as MapDate;
		if (!date || !date.path) {
			error(404, { message: `Failed to find date "${dateStr}"` });
		}
		
		const res = await fetch(date.path);
		if (!res.ok) {
			console.log(`Failed to fetch ${date.path} with return code ${res.status}.`);
			error(404, { message: `Failed to fetch "${slug}"` });
		}
		
		const postRaw = await res.text();

		// `content` is the body with the fence removed so the
		// header outline and reading time ignore the metadata block.
		const { data: frontmatter, content: postBody } = readHikeFrontmatter(postRaw);
		const { hike: mergedHike, date: mergedDate } = applyHikeOverrides(hike as unknown as Map, date, frontmatter);
		const fmContacts = readHikeContacts(frontmatter);
		const contacts = buildHikeContacts(mergedDate.people, contactsBook, fmContacts);

		const headerRegex = /#{2} (.*)\r?\n/g;
		const headers = Array.from(postBody.matchAll(headerRegex), x => x[1]);
		const stats = readingTime(postBody);
		const allPosts = getAllPosts();
		const postIndex = allPosts.findIndex(p => p.anchor === slug);
		const page = postIndex !== -1 ? Math.floor(postIndex / defaultPageSize) + 1 : 1;

		locals.postContent = await parseMarkdown(postRaw);

		let showStatistics = false;
		let showFilePrimary: string | null = null;
		let showFileGpx: string | null = null;

		const gpxUrl = mergedDate.gpx ?? mergedHike.properties.filePath.replace('geojson', 'gpx').replace('json', 'gpx');
		const [gpx, geojsonRes] = await Promise.all([
			fetch(gpxUrl, { method: 'OPTIONS' }),
			fetch(mergedHike.properties.filePath),
		]);
		showFileGpx = gpx.ok ? gpxUrl : null;

		let mapProperties = mergedHike.properties as MapProperties;
		if (geojsonRes.ok) {
			const geojson = await geojsonRes.json();
			const fp = geojson?.features?.[0]?.properties;
			if (fp) {
				showFilePrimary = mergedHike.properties.filePath;
				mapProperties = <MapProperties>{
					...mergedHike.properties,
					...mergeMetrics(mergedHike.properties, fp),
				};
			}
		}

		return {
			post: {
				title: mergedDate.title ?? mergedHike.name,
				description: (mergedDate.description ? (mergedDate.description + ' ') : '') + mergedHike.description,
				image: mergedDate.image?.replace('/hikes/', '/hikes/thumb/') ?? mergedHike.image?.replace('/hikes/', '/hikes/thumb/'),
				imageFull: mergedDate.image ?? mergedHike.image,
				headers: headers,
				time: stats.text,
				date: dateStr,
				tags: mergedDate.tags,
				author: mergedDate.author ?? resume.basics.name,
				anchor: slug ?? '',
				page,
			},
			map: { ...mergedHike, properties: mapProperties },
			contacts,
			display: {
				statistics: showStatistics,
				filePrimary: showFilePrimary,
				fileGpx: showFileGpx,
			},
		};
	} catch (ex) {
		console.log(ex);
		error(500);
	}
};
