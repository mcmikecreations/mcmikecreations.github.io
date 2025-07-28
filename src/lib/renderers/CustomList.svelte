<script lang="ts">
	import { List } from 'flowbite-svelte';

	interface Props {
		ordered?: boolean;
		start: number;
		children?: import('svelte').Snippet;
	}

	let { ordered = false, start, children }: Props = $props();
</script>

{#if ordered}
	<List tag="ol" {start} class="ps-4 mb-4 [&_ul]:mb-0 [&_ol]:mb-0">{@render children?.()}</List>
{:else}
	<List tag="ul" class="ps-4 mb-4 [&_ul]:mb-0 [&_ol]:mb-0">{@render children?.()}</List>
{/if}
