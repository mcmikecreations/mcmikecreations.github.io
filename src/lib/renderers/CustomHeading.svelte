<script lang="ts">
	import { Heading } from 'flowbite-svelte';

	interface Props {
		depth?: number;
		raw?: string;
		children?: import('svelte').Snippet;
	}

	let { depth = 0, raw = '', children }: Props = $props();
</script>

{#if depth <= 6}
	<Heading tag="h{depth}" class="mb-4">{@render children?.()}</Heading>
{:else}
	{raw}
{/if}
