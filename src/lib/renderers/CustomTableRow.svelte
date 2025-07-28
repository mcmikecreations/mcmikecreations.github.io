<script lang="ts">
	import { TableBodyRow } from 'flowbite-svelte';
	import { getContext } from 'svelte';
	interface Props {
		children?: import('svelte').Snippet;
	}

	let { children }: Props = $props();

	const isHead = getContext('IsCustomTableHead');
</script>

{#if isHead}
	{@render children?.()}
{:else}
	<TableBodyRow>{@render children?.()}</TableBodyRow>
{/if}
