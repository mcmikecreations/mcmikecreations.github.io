import hikes from '$lib/data/hikes.json';
import type { Map } from '$lib/data/map-info';

export function load() {
	const posts = (hikes as Map[]).flatMap(h => h.properties.dates
		.filter(d => !h.properties.draft && d.path)
		.map(d => {
			const date = new Date(d.date);
			const slug = h.route.substring(h.route.lastIndexOf('/') + 1);
			return {
				year: date.getFullYear(),
				month: date.getMonth() + 1,
				day: date.getDate(),
				date: date,
				url: `/hikes/${d.date}-${slug}/`,
				title: d.title ?? h.name,
				image: d.image ?? h.image,
				description: (d.description ? (d.description + ' ') : '') + h.description,
				tags: d.tags,
				people: d.people
			};
		}));
	posts.sort((a, b) => a.date > b.date ? -1 : (a.date < b.date ? 1 : 0));
	return {
		posts: posts,
		showProgressbar: false,
		showPeople: false,
		footer: {
			pinBottom: false,
			showSocials: true,
		},
		header: {
			showNavbar: false,
			fixedNavbar: true,
		}
	};
}
