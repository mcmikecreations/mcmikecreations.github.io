<script lang="ts">
	/* eslint-disable svelte/no-at-html-tags */
	import type { PageData } from './$types';
	import AppTitle from '$lib/components/AppTitle.svelte';
	import { GlobeSolid } from 'flowbite-svelte-icons';
	import ProjectImage from '$lib/components/ProjectImage.svelte';

	export let data: PageData;
</script>

<AppTitle title={data.project.name} />

<main class="mx-4 2xl:mx-0 mb-8 md:px-24">
	<article class="flex-grow prose dark:prose-invert prose-a:text-primary-600 dark:prose-a:text-primary-500 md:prose-lg lg:prose-xl min-h-80 max-w-none">
		{#if data.project.image}
			<div class="sm:float-start me-4">
				<ProjectImage p={data.project} class="size-80 mx-auto" />
			</div>
		{/if}
		<h2>
			<span class="inline-flex justify-center items-center">
				{data.project.name}
				{#if data.project.url}<a href={data.project.url} class="ps-2" target="_blank"><GlobeSolid size="xl" class="inline" /></a>{/if}
			</span>
		</h2>
		<blockquote>{@html data.project.quote}</blockquote>
		<p>
			{@html data.project.description}
		</p>
	</article>
</main>
