import type { PageLoad } from './$types';

export const load: PageLoad = ({ data }) => {
	return {
		// Server load provides the latest blog posts (parsed from markdown).
		...data,
		footer: {
			pinBottom: false,
			showSocials: false,
		},
	};
};
