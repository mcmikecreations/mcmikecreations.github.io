<script>
	import { List, Li } from 'flowbite-svelte';

	export let ordered = false;
	export let start;
</script>

{#if ordered}
	<List tag="ol" {start} class="ps-4 mb-4"><slot></slot></List>
{:else}
	<List tag="ul" class="ps-4 mb-4"><slot></slot></List>
{/if}
