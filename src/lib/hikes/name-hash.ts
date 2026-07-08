import { normalize } from './search-normalize';

/**
 * Shared salt for participant-name hashing. Duplicated verbatim in
 * static/hikes/suggestions.php. It ships to the client, so it is not secret —
 * it only defeats trivial precomputed rainbow tables of common names.
 */
export const NAME_HASH_SALT = 'mykolamor-hikes-people-v1';

async function sha256Hex(input: string): Promise<string> {
	const data = new TextEncoder().encode(input);
	const digest = await crypto.subtle.digest('SHA-256', data);
	const hex = Array.from(new Uint8Array(digest))
		.map((b) => b.toString(16).padStart(2, '0'))
		.join('');
	return hex.slice(0, 16);
}

export function tokenize(text: string): string[] {
	return text
		.split(/\s+/)
		.map((t) => t.trim())
		.filter((t) => t.length > 0);
}

export function hashToken(rawToken: string): Promise<string> {
	return sha256Hex(NAME_HASH_SALT + normalize(rawToken));
}

export async function hashPeople(names: string[]): Promise<string[]> {
	const tokens = names.flatMap((n) => tokenize(n));
	const hashes = await Promise.all(tokens.map((t) => hashToken(t)));
	return Array.from(new Set(hashes));
}

export async function hashQuery(query: string): Promise<string[]> {
	const tokens = tokenize(query);
	const hashes = await Promise.all(tokens.map((t) => hashToken(t)));
	return Array.from(new Set(hashes));
}
