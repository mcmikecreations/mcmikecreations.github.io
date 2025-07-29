<script>
	import { Card, Heading } from 'flowbite-svelte';
	import AppTitle from '$lib/components/AppTitle.svelte';
	import maps from '$lib/data/hikes.json';

	const hikes = [...maps.filter(x => x.properties?.hidden !== true)];
	hikes.sort((a, b) =>
		a.properties.dates[0] > b.properties.dates[0]
		? -1
		: a.properties.dates[0] < b.properties.dates[0]
			? 1
			: 0);
</script>

<AppTitle title="Data Viz" />

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
