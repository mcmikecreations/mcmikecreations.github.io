<script>
	import { TableBodyCell, TableHeadCell } from 'flowbite-svelte';
	import { getContext } from 'svelte';

	export let header;
	export let align;

	const isHead = getContext('IsCustomTableHead');
</script>

{#if isHead || header }
	<TableHeadCell {align}><slot></slot></TableHeadCell>
{:else}
	<TableBodyCell {align}><slot></slot></TableBodyCell>
{/if}
