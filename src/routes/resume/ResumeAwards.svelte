<script>
	import resume from '$lib/data/resume.json';
	import { A, Heading, Li, List } from 'flowbite-svelte';
</script>

<div class="flex flex-row flex-wrap gap-8 justify-between mb-8 mx-4 2xl:mx-0">
	<div class="min-w-60 flex-1">
		<Heading tag="h2" class="text-2xl mb-2">Certificates</Heading>
		<List tag="ul" class="text-base text-gray-900 dark:text-white leading-normal font-normal text-left whitespace-normal">
			{#each resume.certificates as p}
				<Li class="">
					<span>{p.name},</span>
					<span>delivered by {p.issuer},</span>
					<span>{new Date(p.date).toLocaleDateString('en-us', { year:"numeric", month:"short" })},</span>
					<A href={p.url}>[Online Access]</A>
				</Li>
			{/each}
		</List>
	</div>

	<div class="min-w-60 flex-1">
		<Heading tag="h2" class="text-2xl mb-2">Awards</Heading>
		<List tag="ul" class="text-base text-gray-900 dark:text-white leading-normal font-normal text-left whitespace-normal">
			{#each resume.awards as p}
				<Li class="">
					<span>{p.title},</span>
					<span>{p.awarder},</span>
					<span>{p.summary}</span>
					<span>({new Date(p.date).toLocaleDateString('en-us', { year:"numeric", month:"short" })})</span>
				</Li>
			{/each}
		</List>
	</div>
</div>
