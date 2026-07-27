import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import type { HttpError } from '@sveltejs/kit'
import type { Map } from '$lib/data/map-info';
import hikes from '$lib/data/hikes.json';
import { getAllPosts, parseMarkdown } from '$lib/hikes/hikes-info';
import type { EntryGenerator } from './$types';
import { browser } from '$app/environment';

export const entries: EntryGenerator = () => {
	return getAllPosts().map((p) => ({ slug: p.anchor }));
};

let hasHydrated = false;

export const load: PageLoad = async ({ data, fetch, params, url }) => {
	try {
		const slug = params.slug.endsWith('.html')
			? params.slug.substring(0, params.slug.length - '.hmtl'.length)
			: params.slug;
		// Get the post.
		const regex = /^(\d{4}-\d{2}-\d{2})-(.+)$/gm;
		let m: RegExpExecArray | null;

		do {
			m = regex.exec(slug);
			if (!m) break;

			const dateStr = m[1];
			const routeStr = m[2];
			const hike: Map | undefined = hikes.find(h => h.route.split('/').pop() === routeStr);
			if (!hike) break;

			const date = hike.properties.dates.find((d: any) => d.date === dateStr);
			if (!date || !date.path) break;

			let clientHtml: string | undefined = undefined;

			if (browser) {
				if (hasHydrated) {
					// Client-side navigation: fetch the raw markdown and parse it on the client
					// to avoid hitting the full index.html or bundling it in __data.json
					const res = await fetch(date.path);
					if (res.ok) {
						const postRaw = await res.text();
						clientHtml = await parseMarkdown(postRaw);
					}
				} else {
					hasHydrated = true;
				}
			}

			return {
				post: data.post,
				map: data.map,
				display: data.display,
				contacts: data.contacts,
				clientHtml,
			};
			// eslint-disable-next-line no-constant-condition
		} while (false);

		error(404);
	} catch (ex) {
		if ((ex as HttpError) !== undefined) {
			throw ex;
		} else {
			console.log(ex);
			error(500);
		}
	}
};