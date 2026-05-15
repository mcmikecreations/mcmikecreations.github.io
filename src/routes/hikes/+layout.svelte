<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		children?: Snippet;
	}

	let { children }: Props = $props();
</script>

<svelte:head>
	<link
		rel="search"
		type="application/opensearchdescription+xml"
		href="/opensearch-hikes.xml"
		title="Search Hikes"
	/>
</svelte:head>

{@render children?.()}
