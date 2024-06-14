<script lang="ts">
	/* eslint-disable svelte/no-at-html-tags */
	import type { PageData } from './$types';
	import AppTitle from '$lib/components/AppTitle.svelte';
	import PlanetoidGen from './PlanetoidGen.svelte';
	import LandscapeGen from './LandscapeGen.svelte';

	export let data: PageData;
</script>

<AppTitle title={data.project.name} />

<main>
	<article class="flex-grow prose dark:prose-invert prose-a:text-primary-600 dark:prose-a:text-primary-500 md:prose-lg lg:prose-xl min-h-80 max-w-none">
		<PlanetoidGen {data} />
		<LandscapeGen />
	</article>
</main>
