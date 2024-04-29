<script lang="ts">
	import resume from '$lib/data/resume.json';
	import { page } from '$app/stores';

	const oldUrl = $page.url;
	const canonicalUrl = new URL(oldUrl.origin.replace('www.', '') + oldUrl.pathname + oldUrl.search);
	const titleBase = resume.basics.name;
	export let title : string | undefined;
</script>

<svelte:head>
	<title>{titleBase + (title ? (' | ' + title) : '')}</title>
	<link rel="canonical" href={canonicalUrl.toString()} />
</svelte:head>
