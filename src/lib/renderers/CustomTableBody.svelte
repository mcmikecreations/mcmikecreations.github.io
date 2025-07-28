<script lang="ts">
	import { TableBody } from 'flowbite-svelte';
	interface Props {
		children?: import('svelte').Snippet;
	}

	let { children }: Props = $props();
</script>

<TableBody>{@render children?.()}</TableBody>
