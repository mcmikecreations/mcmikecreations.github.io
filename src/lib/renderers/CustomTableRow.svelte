<script>
	import { TableBodyRow } from 'flowbite-svelte';
	import { getContext } from 'svelte';

	const isHead = getContext('IsCustomTableHead');
</script>

{#if isHead }
	<slot></slot>
{:else}
	<TableBodyRow><slot></slot></TableBodyRow>
{/if}
