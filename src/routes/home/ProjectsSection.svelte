<script>
	import { A, Heading } from 'flowbite-svelte';
	import resume from '$lib/data/resume.json';
	import { GlobeSolid } from 'flowbite-svelte-icons';
	import ProjectImage from '$lib/components/ProjectImage.svelte';

	const projects = resume.projects.slice(0, 6);
</script>

<section id="projects">
	<Heading tag="h2" class="text-center mt-8">Featured <A href="/projects">Projects</A></Heading>
	<div class="flex flex-wrap justify-center sm:grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-8 mx-4 2xl:mx-0">
		{#each projects as p}
			<a href={p.route} class="min-w-40 max-w-sm lg:max-w-lg">
				<ProjectImage aria-label="page image" {p} />
				<div class="py-4">
					<Heading tag="h3" class="text-center whitespace-nowrap text-lg md:text-xl lg:text-2xl">
						{p.name}
						{#if p.url}<A href={p.url} class="ps-2 align-bottom" target="_blank"><GlobeSolid size="xl" ariaLabel="website" /></A>{/if}
					</Heading>
				</div>
			</a>
		{/each}
	</div>
</section>