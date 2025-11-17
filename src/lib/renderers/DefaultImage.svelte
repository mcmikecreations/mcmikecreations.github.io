<script lang="ts">
	import { Modal } from 'flowbite-svelte';

	interface Props {
		href?: string;
		title?: any;
		text?: string;
	}

	let { href = '', title = undefined, text = '' }: Props = $props();
	let openModal = $state(false);
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
		<button
			type="button"
			onclick={() => (openModal = true)}
		>
			<img src={href} {title} alt={text} class="pointer-events-none !my-0" />
		</button>
		<figcaption class="text-center">{text}</figcaption>
	</figure>
	<Modal bind:open={openModal} fullscreen size="none" classes={{ close: "bg-white dark:bg-gray-900" }}>
		<div class="flex w-full h-full items-center justify-center">
			<img src={href} {title} alt={text} class="w-full h-full object-contain" />
		</div>
	</Modal>
{/if}
