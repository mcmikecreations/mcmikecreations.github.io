<script>
	import { A, Button, Card, Heading, Img, P } from 'flowbite-svelte';
	import resume from '$lib/data/resume.json';
	import DateBadge from '$lib/components/DateBadge.svelte';

	const education = resume.education.slice(0, 3);
	const experience = resume.work.slice(0, 3);
</script>

<section id="resume">
	<Heading tag="h2" class="text-center mt-8">Latest <A href="/resume">Résumé</A> Highlights</Heading>
	<div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8 mx-4 2xl:mx-0">
		<Heading tag="h3" class="ps-4 sm:ps-6">Education</Heading>
		<Heading tag="h3" class="hidden sm:block ps-4 sm:ps-6">Experience</Heading>
	</div>
	<div class="flex flex-col sm:grid grid-flow-col grid-rows-6 sm:grid-rows-3 gap-4 mt-4 mx-4 2xl:mx-0">
		{#each education as item}
			<Card class="max-w-none">
				<DateBadge date={new Date(item.startDate)} dateEnd={item.endDate ? new Date(item.endDate) : 'present'} />
				<Heading tag="h4" class="text-xl">{item.studyType + ' in ' + item.area}</Heading>
				{#if item.description}<p class="line-clamp-3">{item.description}</p>{/if}
				<div class="flex-grow" />
				<span>
						<A href={item.url} class="text-sm pt-4 sm:pt-6">{item.institution}</A>
						<span>·</span>
						<span class="text-sm">{item.location}</span>
					</span>
			</Card>
		{/each}
		<Heading tag="h3" class="block sm:hidden ps-4 sm:ps-6">Experience</Heading>
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

	<div class="mx-auto mt-8 columns-2 flex flex-wrap justify-center gap-4">
		<div
			class="relative min-w-sm max-w-md p-4
			before:content-[''] before:bg-[url('{resume.basics.image}')]
			before:h-full before:w-full before:absolute before:-z-10 before:top-0 before:left-0
			before:bg-cover before:bg-center before:bg-origin-border
			before:transition-all before:duration-200
			before:blur-xl before:contrast-200 before:opacity-0 before:hover:opacity-25"
		>
			<Img src={resume.basics.image} imgClass="aspect-crt object-cover object-center" alt="Profile" />
		</div>
		<div class="min-w-sm max-w-md flex flex-col p-4">
			<Heading tag="h3">About Me</Heading>
			<P class="py-2">{resume.basics.summary}</P>
			<div class="flex-grow" />
			<div class="flex flex-row">
				<Button href="#contact" class="uppercase" pill>Contact me</Button>
				<Button href="/resume" color="alternative" class="uppercase ms-2" pill>Résumé</Button>
			</div>
		</div>
	</div>
</section>
