import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
	return await resolve(event, {
		transformPageChunk: ({ html }) => {
			if (event.locals.postContent) {
				return html.replace('%%SSR_POST_CONTENT%%', '<!-- SSR_START -->' + event.locals.postContent + '<!-- SSR_END -->');
			}
			return html.replace('%%SSR_POST_CONTENT%%', '');
		}
	});
};
