<script lang="ts">
	import { TableHead } from 'flowbite-svelte';
	import { setContext } from 'svelte';
	interface Props {
		children?: import('svelte').Snippet;
	}

	let { children }: Props = $props();

	setContext('IsCustomTableHead', true);
</script>

<TableHead>{@render children?.()}</TableHead>
