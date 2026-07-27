<script lang="ts">
	import { Card, Heading } from 'flowbite-svelte';
	import AppMeta from '$lib/components/AppMeta.svelte';
	import AppBreadcrumbs from '$lib/components/AppBreadcrumbs.svelte';
	import AppJsonLd from '$lib/components/AppJsonLd.svelte';
	import { hikes as maps } from '$lib/data/hikes-db';

	const hikes = [...maps.filter(x =>
		x.properties?.hidden !== true &&
		x.properties?.dates?.some(d => !d.path)
	)];
	hikes.sort((a, b) =>
		a.properties.dates[0].date > b.properties.dates[0].date
		? -1
		: a.properties.dates[0].date < b.properties.dates[0].date
			? 1
			: 0);
</script>

<AppMeta title="Data Viz" description="Data visualization projects I have personally developed." type="website" />
<AppBreadcrumbs items={[{ name: 'Home', href: '/' }, { name: 'Projects', href: '/projects/' }, { name: 'Data Viz', href: '/projects/data-viz/' }]} />
<AppJsonLd variant="collection" name="Data Viz" description="Data visualization projects I have personally developed." url="/projects/data-viz/" items={hikes.filter(m => !m.properties?.hidden).map(m => ({ name: m.name, url: m.route, image: m.image }))} />

<main>
	<Heading tag="h2" id="hikes">Hikes</Heading>
	<div class="w-fit mx-auto">
		<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-8">
			<Card
					class=""
					href="/projects/data-viz/hikes/all"
					img="/images/projects/data-viz/hikes/thumb/all.jpg"
			>
				<div class="m-4 sm:m-6">
					<Heading tag="h3" class="break-words">🚧 All Hikes</Heading>
				</div>
			</Card>
			{#each hikes as map}
				<Card
						href={map.route}
						img={map.image.replace('/hikes/', '/hikes/thumb/')}
						class="{map.properties?.draft === true ? 'hidden' : ''}"
				>
					<div class="m-4 sm:m-6">
						<Heading tag="h3" class="break-words">{(map.properties.draft ? '⏳ ' : '') + map.name}</Heading>
					</div>
				</Card>
			{/each}
		</div>
	</div>
</main>
