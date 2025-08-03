<script lang="ts">
	interface Props {
		href?: string;
		title?: any;
		text?: string;
	}

	let { href = '', title = undefined, text = '' }: Props = $props();
</script>

{#if href.trimEnd().endsWith('.mp4')}
	<figure class="w-full xl:w-1/2 mx-auto flex-col justify-center">
		<video controls {title}>
			<source src={href} type="video/mp4">
		</video>
		<figcaption class="text-center">{text}</figcaption>
	</figure>
{:else}
	<figure class="w-full xl:w-1/2 mx-auto flex flex-col justify-center">
		<img src={href} {title} alt={text} />
		<figcaption class="text-center">{text}</figcaption>
	</figure>
{/if}
