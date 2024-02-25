<script lang="ts">
	import { ImageSolid } from 'flowbite-svelte-icons';
	import { twMerge } from "tailwind-merge";

	export let p : {
		name: string;
		quote: string;
		url?: string | null | undefined;
		route: string;
		description: string;
		image?: string | null | undefined;
		imageDark?: string | null | undefined;
	};

	export let containerClass = 'aspect-square min-w-sm bg-gray-100 dark:bg-gray-800 rounded-lg';
</script>

<!-- Preload all images for improved responsivity -->
<svelte:head>
	{#if p.image}
		<link rel="preload" href={p.image} as="image" />
	{/if}
	{#if p.imageDark}
		<link rel="preload" href={p.imageDark} as="image" />
	{/if}
</svelte:head>

<div class={twMerge(containerClass, $$props.class)} {...$$restProps}>
	<div
		style={p.image ? `--pimg-url: url('${p.image}'); --pimg-url-dark: url('${p.imageDark ?? p.image}');` : ""}
		class="w-full h-full flex justify-center items-center bg-center bg-cover bg-[image:var(--pimg-url)] dark:bg-[image:var(--pimg-url-dark)]"
	>
		{#if !(p.imageDark ?? p.image)}<ImageSolid aria-hidden="true" class="size-16 text-gray-900 dark:text-white" />{/if}
	</div>
</div>