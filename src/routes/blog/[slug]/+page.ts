import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import type { HttpError } from '@sveltejs/kit'
import blogs from '$lib/data/blogs.json';

export const load: PageLoad = async ({ data, params }) => {
	try {
        return { post: data.post };
	} catch (ex) {
		if ((ex as HttpError) !== undefined) {
			throw ex;
		} else {
			console.log(ex);
			error(500);
		}
	}
};