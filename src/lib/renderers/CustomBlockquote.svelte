<script lang="ts">
	import { Blockquote } from 'flowbite-svelte';
	interface Props {
		children?: import('svelte').Snippet;
	}

	let { children }: Props = $props();
</script>

<Blockquote border bg class="p-4 my-4">{@render children?.()}</Blockquote>
