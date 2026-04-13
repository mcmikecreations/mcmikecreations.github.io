<script lang="ts">
	import AppToc from '$lib/components/AppToc.svelte';
	import { page } from '$app/state';
	interface Props {
		children?: import('svelte').Snippet;
	}

	let { children }: Props = $props();
</script>

<section class="container mx-auto my-8">
	<div class="mx-4 2xl:mx-0 md:px-24 mb-8 flex flex-row-reverse">
		{#if page.data.toc?.enabled ?? false}
			<AppToc />
		{/if}
		{@render children?.()}
	</div>
</section>
