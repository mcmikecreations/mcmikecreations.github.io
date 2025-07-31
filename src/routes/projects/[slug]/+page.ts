import { error } from '@sveltejs/kit';
import resume from '$lib/data/resume.json';
import type { PageLoad } from './$types';
import type { HttpError } from '@sveltejs/kit';

export const load: PageLoad = async ({ params }) => {
	try {
		const project = resume.projects.find((x) => x.route.includes(params.slug));

		if (!project) {
			console.log(`Failed to fetch /projects/${params.slug}.`);
			error(404, { message: `Failed to fetch "${params.slug}"` });
		}

		// Find all headers. The first one will be the page title.
		return {
			project: project,
			toc: {
				enabled: false,
			}
		};
	} catch (ex) {
		if ((ex as HttpError) !== undefined) {
			throw ex;
		} else {
			console.log(ex);
			error(500);
		}
	}
};