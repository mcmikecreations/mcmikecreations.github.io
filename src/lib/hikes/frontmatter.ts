/**
 * Browser-safe helpers for YAML front matter in hike markdown files.
 */

const FRONT_MATTER_RE = /^\uFEFF?---[ \t]*\r?\n[\s\S]*?\r?\n---[ \t]*\r?\n?/;

/**
 * Return the markdown body with a leading YAML front matter block removed.
 */
export function stripFrontmatter(raw: string): string {
	return raw.replace(FRONT_MATTER_RE, '');
}
