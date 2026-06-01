export const BLOG_TITLE = 'Programming Blog | Frontend, Backend & Gamedev';
export const BLOG_DESCRIPTION = 'Personal programming blog of Mykola Morozov';

export const blogListTitle = (page: number) =>
	`Programming Blog - Page ${page} | Mykola Morozov`;

export const blogListDescription = (page: number) =>
	`Browse programming blog posts - Page ${page}`;

export const blogTagTitle = (tag: string, page: number) => {
	const suffix = page > 1 ? ` - Page ${page}` : '';
	return `Posts tagged "${tag}"${suffix} | Programming Blog`;
};

export const blogTagDescription = (tag: string, page: number) => {
	const suffix = page > 1 ? ` - Page ${page}` : '';
	return `Browse programming blog posts tagged with ${tag}${suffix}`;
};

export const blogYearTitle = (year: number, page: number) => {
	const suffix = page > 1 ? ` - Page ${page}` : '';
	return `Blog posts from ${year}${suffix} | Programming Blog`;
};

export const blogYearDescription = (year: number, page: number) => {
	const suffix = page > 1 ? ` - Page ${page}` : '';
	return `Browse programming blog posts from ${year}${suffix}`;
};
