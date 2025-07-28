<script lang="ts">
	import { Table } from 'flowbite-svelte';
	interface Props {
		children?: import('svelte').Snippet;
	}

	let { children }: Props = $props();
</script>

<Table>{@render children?.()}</Table>
