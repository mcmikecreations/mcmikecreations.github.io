/**
 * Shared pagination URL builder for the blog and hikes listings.
 */

/**
 * The URL of a listing page. `baseUrl` is a section root such as `/hikes` or
 * `/blog/tag/Climb` and must already be percent-encoded; page 1 is the root
 * itself rather than a redundant `/page/1/`.
 */
export function getPageUrl(baseUrl: string, page: number): string {
	const base = baseUrl.replace(/\/+$/, '');
	return page === 1 ? `${base}/` : `${base}/page/${page}/`;
}
