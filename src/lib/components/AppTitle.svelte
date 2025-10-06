<script lang="ts">
	import resume from '$lib/data/resume.json';
	import { page } from '$app/state';
	import { onMount } from 'svelte';

	const oldUrl = page.url;
	let canonicalUrl = $state(new URL(oldUrl.origin.replace('www.', '') + oldUrl.pathname));
	const titleBase = resume.basics.name;
	interface Props {
		title: string | undefined;
		hasBase?: boolean;
	}

	let { title, hasBase = true }: Props = $props();

	onMount(() => {
		canonicalUrl.search = oldUrl.search;
	});
</script>

<svelte:head>
	<title>{hasBase ? ((title ? (title + ' | ') : '') + titleBase) : (title ? title : titleBase)}</title>
	<link rel="canonical" href={canonicalUrl.toString()} />
</svelte:head>
