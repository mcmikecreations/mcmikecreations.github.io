<script lang="ts">
	import { Modal } from 'flowbite-svelte';

	interface Props {
		href?: string;
		title?: any;
		text?: string;
	}

	let { href = '', title = undefined, text = '' }: Props = $props();
	let openModal = $state(false);
	const isYoutubeLink = href.includes('youtube.com');

	// Track open modal to prevent scrolling the content behind it.
	$effect(() => {
		if (openModal) {
			document.body.classList.add('overflow-hidden');
		} else {
			document.body.classList.remove('overflow-hidden');
		}
		return () => {
			document.body.classList.remove('overflow-hidden');
		};
	});
</script>

<svelte:window
	onkeydown={(e) => {
		if (openModal && e.key === 'Escape') {
			openModal = false;
		}
	}}
/>

{#if isYoutubeLink}
	{@const url = new URL(href)}
	{@const videoId = url.searchParams.get('v')}
	<figure class="w-full xl:w-3/4 mx-auto flex flex-col justify-center">
		<a {href} target="_blank" rel="noopener noreferrer">
			<img
				src={`https://img.youtube.com/vi/${videoId}/0.jpg`}
				{title}
				alt={text}
				class="pointer-events-none !my-0"
			/>
		</a>
		<figcaption class="text-center">{text}</figcaption>
	</figure>
{:else if href.trimEnd().endsWith('.mp4')}
	<figure class="w-full xl:w-3/4 mx-auto flex-col justify-center">
		<video controls {title}>
			<source src={href} type="video/mp4">
		</video>
		<figcaption class="text-center">{text}</figcaption>
	</figure>
{:else}
	<figure class="w-full xl:w-3/4 mx-auto flex flex-col justify-center">
		<button
			type="button"
			onclick={() => (openModal = true)}
		>
			<img src={href} {title} alt={text} class="pointer-events-none !my-0" />
		</button>
		<figcaption class="text-center">{text}</figcaption>
	</figure>
	<Modal bind:open={openModal} fullscreen size="none" classes={{ close: 'bg-white dark:bg-gray-900' }}>
		<div
			class="flex h-full w-full items-center justify-center outline-none overscroll-contain"
			role="button"
			tabindex="0"
			onclick={() => (openModal = false)}
			onkeydown={(e) => {
				if (e.key === 'Enter') openModal = false;
			}}
		>
			<img
				src={href}
				{title}
				alt={text}
				class="max-h-full max-w-full object-contain"
				onclick={(e) => e.stopPropagation()}
				role="img"
				onkeydown={(e) => e.stopPropagation()}
			/>
		</div>
	</Modal>
{/if}
