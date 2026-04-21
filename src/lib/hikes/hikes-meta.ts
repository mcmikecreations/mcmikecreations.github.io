export const HIKES_BLOG_TITLE =
	'Hiking, Climbing, Via Ferrata & Trail Maps | Personal Hike Experiences';
export const HIKES_BLOG_DESCRIPTION = 'The most thorough hike reviews on the web';
export const HIKES_HERO_IMAGE = '/images/hikes/hero/hike_poster_4_bg_2.png';

export const hikePostTitle = (title: string) => `${title} | Hike`;

export const hikesListTitle = (page: number) =>
	`Hiking Blog - Page ${page} | Personal Hike Experiences`;

export const hikesListDescription = (page: number) =>
	`Browse hiking blog posts - Page ${page}`;

export const HIKES_TAG_WEB_TITLE = 'Web of Hikes | Collecting All Routes and Peaks';
export const HIKES_TAG_WEB_DESCRIPTION =
	'Visiting all peaks in the biggest possible area while using the same departure and arrival points as other hikes.';
export const HIKES_TAG_CLIMB_TITLE = 'Via Ferrata Adventures | Steep Routes and Climbing Sections';

export const hikesTagTitle = (tag: string, page: number) => {
	const suffix = page > 1 ? ` - Page ${page}` : '';
	return `Hikes tagged "${tag}"${suffix} | Personal Hike Experiences`;
};

export const hikesTagDescription = (tag: string, page: number) => {
	const suffix = page > 1 ? ` - Page ${page}` : '';
	return `Browse hiking blog posts tagged with ${tag}${suffix}`;
};

export const hikesYearTitle = (year: number, page: number) => {
	const suffix = page > 1 ? ` - Page ${page}` : '';
	return `Hikes from ${year}${suffix} | Personal Hike Experiences`;
};

export const hikesYearDescription = (year: number, page: number) => {
	const suffix = page > 1 ? ` - Page ${page}` : '';
	return `Browse hiking blog posts from ${year}${suffix}`;
};
