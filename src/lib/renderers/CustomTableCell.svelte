<script lang="ts">
	import { TableBodyCell, TableHeadCell } from 'flowbite-svelte';
	import { getContext } from 'svelte';

	let { header, align, children } = $props();

	const isHead = getContext('IsCustomTableHead');
</script>

{#if isHead || header}
	<TableHeadCell {align}>{@render children?.()}</TableHeadCell>
{:else}
	<TableBodyCell {align}>{@render children?.()}</TableBodyCell>
{/if}
