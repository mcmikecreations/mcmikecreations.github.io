import { error } from '@sveltejs/kit';
import resume from '$lib/data/resume.json';
import type { PageLoad } from './$types';
import type { HttpError } from '@sveltejs/kit';

const projectName = 'planetoid-gen';

export const load: PageLoad = async () => {
	try {
		const project = resume.projects.find((x) => x.route.includes(projectName));

		if (!project) {
			console.log(`Failed to fetch /projects/${projectName}.`);
			error(404, { message: `Failed to fetch "${projectName}"` });
		}

		// Find all headers. The first one will be the page title.
		return {
			project: project,
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