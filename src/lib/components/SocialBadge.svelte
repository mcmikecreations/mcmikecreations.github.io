<script lang="ts">
	import { Button, Span } from 'flowbite-svelte';
	import resume from '$lib/data/resume.json';
	import { twMerge } from 'tailwind-merge';



	interface Props {
		pill?: boolean;
		outline?: boolean;
		plain?: boolean;
		captioned?: boolean;
		profile: {
		network: string,
		username?: string,
		url: string,
	} | string | undefined;
		size?: string;
		padding?: string;
		children?: import('svelte').Snippet;
	}

	let {
		pill = true,
		outline = true,
		plain = false,
		captioned = false,
		profile = $bindable(),
		size = '[&>*]:!size-4 xl:[&>*]:!size-8',
		padding = '!p-2 xl:!p-4',
		children
	}: Props = $props();

	const innerProfile = (typeof profile === 'string')
		? profile = resume.basics.profiles.find(x => x.network === profile)
		: profile;
</script>

<div class="flex flex-row gap-4 content-end items-center">
	{#if plain}
		<a
			aria-label={innerProfile?.network}
			href={innerProfile?.url} target="_blank"
			class={twMerge(padding, size, 'text-center font-medium focus-within:outline-hidden inline-flex items-center justify-center px-5 py-2.5 text-sm text-gray-900 dark:text-gray-400 hover:text-white hover:bg-gray-900 focus-within:bg-gray-900 focus-within:text-white dark:hover:text-white dark:hover:bg-gray-600 dark:bg-transparent rounded-full')}
		>
			{@render children?.()}
		</a>
	{:else}
		<Button
			aria-label={innerProfile?.network}
			href={innerProfile?.url} target="_blank"
			color="alternative"
			class={twMerge(padding, size)}
			{pill} {outline}
		>
			{@render children?.()}
		</Button>
	{/if}
	{#if captioned}<Span class="text-md xl:text-xl">{innerProfile?.network}</Span>{/if}
</div>