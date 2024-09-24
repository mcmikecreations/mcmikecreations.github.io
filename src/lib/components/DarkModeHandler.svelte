<script>
	import { initTheme } from '$lib/components/DarkModeStore.js';
	import { onMount } from 'svelte';

	onMount(() => {
		const theme = initTheme();
		const dark = theme.style === 'dark';
		dark ? window.document.documentElement.classList.add('dark') : window.document.documentElement.classList.remove('dark');
	});
</script>

<svelte:head>
	<script>
		if ('color-theme' in localStorage) {
			// explicit preference - overrides author's choice
			const dark = localStorage.getItem('color-theme') === 'dark';
			dark ? window.document.documentElement.classList.add('dark') : window.document.documentElement.classList.remove('dark');
		} else {
			// browser preference - does not override
			const dark = window.matchMedia('(prefers-color-scheme: dark)').matches;
			dark ? window.document.documentElement.classList.add('dark') : window.document.documentElement.classList.remove('dark');
		}

		window.document.documentElement.addEventListener('theme', (e) => {
			const dark = e.detail?.style === 'dark';
			dark ? window.document.documentElement.classList.add('dark') : window.document.documentElement.classList.remove('dark');
		});
	</script>
</svelte:head>