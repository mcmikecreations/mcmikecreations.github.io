<script lang="ts">
	import { P } from 'flowbite-svelte';
	interface Props {
		children?: import('svelte').Snippet;
	}

	let { children }: Props = $props();
</script>

<P class="mb-4">{@render children?.()}</P>
