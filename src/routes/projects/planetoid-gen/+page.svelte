<script lang="ts">
	/* eslint-disable svelte/no-at-html-tags */
	import type { PageData } from './$types';
	import AppTitle from '$lib/components/AppTitle.svelte';
	import AppBreadcrumbs from '$lib/components/AppBreadcrumbs.svelte';
	import AppJsonLd from '$lib/components/AppJsonLd.svelte';
	import PlanetoidGen from './PlanetoidGen.svelte';
	import LandscapeGen from './LandscapeGen.svelte';

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
		<PlanetoidGen {data} />
		<LandscapeGen />
	</article>
</main>
