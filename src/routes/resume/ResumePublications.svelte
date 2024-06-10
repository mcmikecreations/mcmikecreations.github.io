<script>
	import { Heading, Li, List, P } from 'flowbite-svelte';
	import resume from '$lib/data/resume.json';
	import Publication from '$lib/components/Publication.svelte';
</script>

<div class="mx-4 2xl:mx-0">
	<Heading tag="h2" class="text-2xl mb-2">Publications</Heading>
	<List tag="ul" list="none" class="divide-y divide-gray-200 dark:divide-gray-700">
		{#each resume.publications as p}
			<Li class="py-3 sm:py-4">
				<P>
					<Publication pub={p} />
				</P>
			</Li>
		{/each}
	</List>
</div>
