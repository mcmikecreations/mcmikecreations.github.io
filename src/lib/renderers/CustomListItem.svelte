<script lang="ts">
	import { Li } from 'flowbite-svelte';
	interface Props {
		children?: import('svelte').Snippet;
	}

	let { children }: Props = $props();
</script>

<Li class="text-base text-gray-900 dark:text-white leading-normal font-normal text-left whitespace-normal">{@render children?.()}</Li>
