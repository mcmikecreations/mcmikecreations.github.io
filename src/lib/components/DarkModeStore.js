export let currentTheme = { style: 'light' };

/**
 * @param {{ style: 'dark' | 'light' }} theme
 */
export function emitThemeEvent(theme) {
	window.document.documentElement.dispatchEvent(new CustomEvent("theme", { detail: theme, }));
	currentTheme = theme;
}

export function initTheme() {
	/**
	 * @type {{ style: 'dark' | 'light' }}
	 */
	let theme;
	if ('color-theme' in localStorage) {
		// explicit preference - overrides author's choice
		const dark = localStorage.getItem('color-theme') === 'dark';
		theme = { style: dark ? 'dark' : 'light' };
	} else {
		// browser preference - does not override
		const dark = window.matchMedia('(prefers-color-scheme: dark)').matches;
		theme = { style: dark ? 'dark' : 'light' };
	}

	emitThemeEvent(theme);
	return theme;
}

// @ts-expect-error ev parameter type can be a MouseEvent or other, shows a missing type comment.
export const toggleTheme = (ev) => {
	/** @type {Node} */ const target = ev.target;
	if (!target || !target.ownerDocument) return;

	const dark = !target.ownerDocument.documentElement.classList.contains('dark');
	if (target.ownerDocument === document) {
		// we are NOT in the iFrame
		localStorage.setItem('color-theme', dark ? 'dark' : 'light');
		emitThemeEvent({ style: dark ? 'dark' : 'light' });
	}
};
