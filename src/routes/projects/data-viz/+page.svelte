<script>
	import { Card, Heading } from 'flowbite-svelte';
	import AppTitle from '$lib/components/AppTitle.svelte';
	import maps from '$lib/data/hikes.json';
</script>

<AppTitle title="Data Viz" />

<main class="md:px-24 mx-4 2xl:mx-0">
	<Heading tag="h2" id="hikes">Hikes</Heading>
	<div class="w-fit mx-auto">
		<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-8">
			<Card href="/projects/data-viz/hikes/all" img="/images/projects/data-viz/hikes/all.jpg">
				<Heading tag="h3" class="break-words">🚧 All Hikes</Heading>
			</Card>
			{#each maps as map}
				<Card href={map.route} img={map.image}>
					<Heading tag="h3" class="break-words">{map.name}</Heading>
				</Card>
			{/each}
		</div>
	</div>
</main>
