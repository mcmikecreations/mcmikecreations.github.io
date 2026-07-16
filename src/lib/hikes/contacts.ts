/**
 * Central, name-keyed contact book + merge into a post's participant roster.
 *
 * The roster comes from a hike date's `people` (hikes.json); contact details
 * (avatar, links) are enriched from the shared `contacts.json` book, and a
 * post's front-matter `contacts` block overrides the book by name using the
 * same present-and-non-null rule as `applyHikeOverrides`. Pure, dependency-free,
 * and browser-safe; never throws (bad entries are dropped silently so a typo in
 * `contacts.json` cannot break a page).
 */

import { isPlainObject, readContactLink } from '$lib/hikes/frontmatter';
import type { HikeContact, HikeContactLink } from '$lib/hikes/frontmatter';

/** Raw name-keyed contact book, as loaded from `contacts.json`. */
export type ContactBook = Record<string, unknown>;

/** Trim a value if it is a non-empty string, otherwise return null. */
function cleanString(value: unknown): string | null {
	if (typeof value !== 'string') return null;
	const trimmed = value.trim();
	return trimmed.length > 0 ? trimmed : null;
}

interface BookEntry {
	avatar: string | null;
	links: HikeContactLink[];
}

/** Normalize a single book entry; the person's name comes from the map key. */
function readBookEntry(raw: unknown): BookEntry {
	if (!isPlainObject(raw)) return { avatar: null, links: [] };
	const links = Array.isArray(raw.links)
		? raw.links.map(readContactLink).filter((l): l is HikeContactLink => l !== null)
		: [];
	return { avatar: cleanString(raw.avatar), links };
}

/**
 * Build the ordered list of participant cards for a post.
 *
 * Every name in `people` yields a card (bare — user icon, no links — when the
 * person is absent from both the book and the front matter). A front-matter
 * entry overrides the book for a matching name: its `avatar` wins when present,
 * its `links` win when non-empty. Any front-matter person not listed in
 * `people` is appended as a guest card, in front-matter order.
 */
export function buildHikeContacts(
	people: string[] | null | undefined,
	book: ContactBook | null | undefined,
	frontmatter: HikeContact[]
): HikeContact[] {
	const safeBook: ContactBook = isPlainObject(book) ? book : {};
	const fmByName = new Map<string, HikeContact>();
	for (const c of frontmatter) fmByName.set(c.name, c);

	const result: HikeContact[] = [];
	const seen = new Set<string>();

	for (const rawName of people ?? []) {
		const name = cleanString(rawName);
		if (!name || seen.has(name)) continue;
		seen.add(name);

		const base = readBookEntry(safeBook[name]);
		const fm = fmByName.get(name);
		result.push({
			name,
			avatar: fm?.avatar ?? base.avatar,
			links: fm && fm.links.length ? fm.links : base.links
		});
	}

	// Front-matter-only people: guests not present in the roster.
	for (const c of frontmatter) {
		if (seen.has(c.name)) continue;
		seen.add(c.name);
		result.push(c);
	}

	return result;
}
