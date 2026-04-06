<script lang="ts">
	interface Props {
		children?: import('svelte').Snippet;
	}

	let { children }: Props = $props();
</script>

<section class="container mx-auto my-8">
	{@render children?.()}
</section>
