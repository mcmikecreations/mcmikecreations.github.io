<script lang="ts">
	import { Button, Span } from 'flowbite-svelte';
	import resume from '$lib/data/resume.json';
	import { twMerge } from 'tailwind-merge';

	export let captioned = false;
	export let profile : {
		network: string,
		username?: string,
		url: string,
	} | string | undefined;

	export let size = 'child:!size-4 child:xl:!size-8';
	export let padding = '!p-2 xl:!p-4';

	const innerProfile = (typeof profile === 'string')
		? profile = resume.basics.profiles.find(x => x.network === profile)
		: profile;
</script>

<div class="flex flex-row gap-4 content-end items-center">
	<Button aria-label={innerProfile?.network} href={innerProfile?.url} color="alternative" class={twMerge(padding, size)} pill outline>
		<slot />
	</Button>
	{#if captioned}<Span class="text-md xl:text-xl">{innerProfile?.network}</Span>{/if}
</div>