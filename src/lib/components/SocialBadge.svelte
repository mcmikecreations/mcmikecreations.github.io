<script lang="ts">
	import { Button, Span } from 'flowbite-svelte';
	import resume from '$lib/data/resume.json';

	export let captioned = false;
	export let profile : {
		network: string,
		username?: string,
		url: string,
	} | string | undefined;

	const innerProfile = (typeof profile === 'string')
		? profile = resume.basics.profiles.find(x => x.network === profile)
		: profile;
</script>

<div class="flex flex-row gap-4 items-center">
	<Button href={innerProfile?.url} color="alternative" class="!p-2 xl:!p-4 child:!size-4 child:xl:!size-8" pill outline>
		<slot />
	</Button>
	{#if captioned}<Span class="text-md xl:text-xl">{innerProfile?.network}</Span>{/if}
</div>