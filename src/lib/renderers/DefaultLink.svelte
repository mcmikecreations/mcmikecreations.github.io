<script lang="ts">
	interface Props {
		href?: string;
		title?: string | null | undefined;
		children?: import('svelte').Snippet;
	}

	let { href = '', title = undefined, children }: Props = $props();
</script>

<a data-sveltekit-reload {href} {title}>{@render children?.()}</a>
