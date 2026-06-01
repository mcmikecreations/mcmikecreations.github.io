<script lang="ts">
	interface Props {
		children?: import('svelte').Snippet;
	}

	let { children }: Props = $props();
</script>

<svelte:head>
	<link
		rel="search"
		type="application/opensearchdescription+xml"
		href="/opensearch-blog.xml"
		title="Search Blog"
	/>
</svelte:head>

<section class="container mx-auto my-8">
	{@render children?.()}
</section>
