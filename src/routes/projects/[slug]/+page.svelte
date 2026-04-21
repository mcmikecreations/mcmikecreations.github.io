<script lang="ts">
	/* eslint-disable svelte/no-at-html-tags */
	import type { PageData } from './$types';
	import AppTitle from '$lib/components/AppTitle.svelte';
	import AppBreadcrumbs from '$lib/components/AppBreadcrumbs.svelte';
	import AppJsonLd from '$lib/components/AppJsonLd.svelte';
	import { GlobeSolid } from 'flowbite-svelte-icons';
	import ProjectImage from '$lib/components/ProjectImage.svelte';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();
</script>

<AppTitle title={data.project.name} />
<AppBreadcrumbs items={[{ name: 'Home', href: '/' }, { name: 'Projects', href: '/projects/' }, { name: data.project.name, href: data.project.route }]} />
<AppJsonLd variant="software" name={data.project.name} description={data.project.quote} image={data.project.image} url={data.project.url} route={data.project.route} />

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
	</article>
</main>
