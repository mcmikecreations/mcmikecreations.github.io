<script lang="ts">
	import { onMount } from 'svelte';

	export let dark = false;

	onMount(() => {
		const observer = new MutationObserver((mutations) => {
			for (const mutation of mutations) {
				if (mutation.target.nodeType === Node.ELEMENT_NODE && mutation.attributeName === 'class') {
					const value = (mutation.target as Element).getAttribute(mutation.attributeName);

					if (value !== null) {
						dark = value.split(' ').includes('dark');
					}
				}
			}
		});

		observer.observe(window.document.documentElement, {
			attributes: true,
		});

		if ('color-theme' in localStorage) {
			// explicit preference - overrides author's choice
			dark = localStorage.getItem('color-theme') === 'dark';
		} else {
			// browser preference - does not overrides
			dark = window.matchMedia('(prefers-color-scheme: dark)').matches;
		}
	});
</script>

<svelte:head>
	{#if dark}
		<style>
        @import 'highlight.js/styles/stackoverflow-dark.min.css';
		</style>
	{:else}
		<style>
        @import 'highlight.js/styles/stackoverflow-light.min.css';
		</style>
	{/if}
</svelte:head>
