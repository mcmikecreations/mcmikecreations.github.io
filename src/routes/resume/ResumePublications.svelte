<script>
	import { A, Heading, Li, List, P } from 'flowbite-svelte';
	import resume from '$lib/data/resume.json';
</script>

<div class="mx-4 2xl:mx-0">
	<Heading tag="h2" class="text-2xl mb-2">Publications</Heading>
	<List tag="ul" list="none" class="divide-y divide-gray-200 dark:divide-gray-700">
		{#each resume.publications as p}
			<Li class="py-3 sm:py-4">
				<P>
					<span>{p.name}</span>
					<span>{p.publisher},</span>
					<span>{new Date(p.releaseDate).toLocaleDateString('en-us', { year:"numeric", month:"short" })},</span>
					<A href={p.url} target="_blank">{p.summary}</A>
				</P>
			</Li>
		{/each}
	</List>
</div>
