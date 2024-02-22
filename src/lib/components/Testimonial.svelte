<script lang="ts">
	import { twMerge } from "tailwind-merge";
	import type { ComponentType } from 'svelte';
	export let icon : ComponentType | undefined = undefined;
	export let figureClass = "max-w-screen-md mx-auto";
	export let figureFooterClass = "flex items-center justify-center mt-6 space-x-3";
	export let iconClass = "size-12 mx-auto mb-3 text-gray-400 dark:text-gray-600";
</script>

<figure class={twMerge(figureClass, $$props.classFigure)}>
	{#if icon}
		<svelte:component this={icon} class={twMerge(iconClass, $$props.classIcon)} />
	{/if}
	<slot />
	{#if $$slots.footer}
		<figcaption class={twMerge(figureFooterClass, $$props.classFigureFooter)}>
			<slot name="footer" />
		</figcaption>
	{/if}
</figure>