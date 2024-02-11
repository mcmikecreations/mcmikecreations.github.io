<script>
	import { Heading } from 'flowbite-svelte';

	export let depth = 0;
	export let raw = '';
</script>

{#if depth <= 6}
	<Heading tag="h{depth}" class="mb-4"><slot></slot></Heading>
{:else}
	{raw}
{/if}
