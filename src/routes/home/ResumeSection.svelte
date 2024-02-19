<script>
	import { A, Card, Heading } from 'flowbite-svelte';
	import resume from '$lib/data/resume.json';
	import DateBadge from '$lib/components/DateBadge.svelte';

	const education = resume.education.slice(0, 3);
	const experience = resume.work.slice(0, 3);
</script>

<section class="container mx-auto">
	<Heading tag="h2" class="text-center mt-8">Latest <A href="/resume">Resume</A> Highlights</Heading>
	<div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8 mx-4 2xl:mx-0">
		<Heading tag="h3">Education</Heading>
		<Heading tag="h3" class="hidden sm:block">Experience</Heading>
	</div>
	<div class="flex flex-col sm:grid grid-flow-col grid-rows-6 sm:grid-rows-3 gap-4 mt-4 mx-4 2xl:mx-0">
		{#each education as item}
			<Card class="max-w-none">
				<DateBadge date={new Date(item.startDate)} dateEnd={item.endDate ? new Date(item.endDate) : 'present'} />
				<Heading tag="h4" class="text-xl">{item.studyType + ' in ' + item.area}</Heading>
				{#if item.description}<p class="line-clamp-3">{item.description}</p>{/if}
				<div class="flex-grow" />
				<A href={item.url} class="text-sm pt-4 sm:pt-6">{item.institution}</A>
			</Card>
		{/each}
		<Heading tag="h3" class="block sm:hidden">Experience</Heading>
		{#each experience as item}
			<Card class="max-w-none">
				<DateBadge date={new Date(item.startDate)} dateEnd={item.endDate ? new Date(item.endDate) : 'present'} />
				<Heading tag="h4" class="text-xl">{item.position}</Heading>
				{#if item.description}<p class="line-clamp-3">{item.description}</p>{/if}
				<div class="flex-grow" />
				<span>
						<A href={item.url} class="text-sm pt-4 sm:pt-6">{item.name}</A>
						<span>·</span>
						<span class="text-sm">{item.location}</span>
					</span>
			</Card>
		{/each}
	</div>
</section>
