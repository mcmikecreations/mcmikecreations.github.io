<script lang="ts">
	import { List } from 'flowbite-svelte';

	export let ordered = false;
	export let start : number;
</script>

{#if ordered}
	<List tag="ol" {start} class="ps-4 mb-4 [&_ul]:mb-0 [&_ol]:mb-0"><slot></slot></List>
{:else}
	<List tag="ul" class="ps-4 mb-4 [&_ul]:mb-0 [&_ol]:mb-0"><slot></slot></List>
{/if}
