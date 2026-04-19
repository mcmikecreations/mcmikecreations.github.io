import type { PageLoad } from './$types';
import { redirect } from '@sveltejs/kit';

export const load: PageLoad = () => {
	redirect(301, '/hikes/tag/Web/');
};
