import anyAscii from 'any-ascii';

export function normalize(s: string): string {
	return anyAscii(s).toLowerCase();
}
