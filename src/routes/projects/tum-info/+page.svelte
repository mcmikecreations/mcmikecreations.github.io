<script lang="ts">
	/* eslint-disable svelte/no-at-html-tags */
	import type { PageData } from './$types';
	import AppTitle from '$lib/components/AppTitle.svelte';
	import { GlobeSolid } from 'flowbite-svelte-icons';
	import ProjectImage from '$lib/components/ProjectImage.svelte';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();
</script>

<AppTitle title={data.project.name} />

<main>
	<article class="flex-grow prose dark:prose-invert prose-a:text-primary-600 dark:prose-a:text-primary-500 md:prose-lg lg:prose-xl min-h-80 max-w-none">
		{#if data.project.image}
			<div class="sm:float-end">
				<ProjectImage p={data.project} class="size-80 mx-auto" />
			</div>
		{/if}
		<h2>
			<span class="inline-flex justify-center items-center">
				{data.project.name}
				{#if data.project.url}<a href={data.project.url} class="ps-2" target="_blank"><GlobeSolid size="xl" class="inline" /></a>{/if}
			</span>
		</h2>
		<div></div>
		<blockquote>{@html data.project.quote}</blockquote>
		<p>
			{@html data.project.description}
		</p>
		<p>
			For example, here is the end-term exam grade distribution plot of the course <b>"IN2386 Cloud-Based Data Processing"</b> for 2023 winter semester:
		</p>
		<div class="w-full flex justify-center">
			<div id="widget-example" class="w-full lg:w-1/2">
				<script src="https://mykolamor.github.io/tum_info/assets/js/course-widget.js" data-course="IN2386" data-semester="23WS" data-container-query="#widget-example"></script>
			</div>
		</div>
		<p>
			The data is available both in a form of the website linked near the page title, as a public API for data science, and as a widget you can see above.
		</p>
	</article>
</main>
