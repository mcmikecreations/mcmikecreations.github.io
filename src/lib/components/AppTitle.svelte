<script lang="ts">
	import resume from '$lib/data/resume.json';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';

	const oldUrl = $page.url;
	let canonicalUrl = new URL(oldUrl.origin.replace('www.', '') + oldUrl.pathname);
	const titleBase = resume.basics.name;
	export let title : string | undefined;

	onMount(() => {
		canonicalUrl.search = oldUrl.search;
	});
</script>

<svelte:head>
	<title>{titleBase + (title ? (' | ' + title) : '')}</title>
	<link rel="canonical" href={canonicalUrl.toString()} />
</svelte:head>
