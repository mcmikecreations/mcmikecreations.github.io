<script>
	import { A, Heading } from 'flowbite-svelte';
	import resume from '$lib/data/resume.json';
	import { ImageSolid } from 'flowbite-svelte-icons';

	const projects = resume.projects.slice(0, 6);
</script>

<section id="projects">
	<Heading tag="h2" class="text-center mt-8">Featured <A href="/projects">Projects</A></Heading>
	<div class="flex flex-wrap justify-center sm:grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-8 mx-4 2xl:mx-0">
		{#each projects as p}
			<a href={p.route} class="min-w-40 max-w-sm lg:max-w-lg">
				<div class="aspect-square min-w-sm bg-gray-200 dark:bg-gray-800 rounded-lg">
					<div
						style="'--pimg-url': url('{p.image}'); --pimg-url-dark: url('{p.imageDark ?? p.image}');"
						class="w-full h-full flex justify-center items-center bg-center bg-cover bg-[image:var(--pimg-url)] dark:bg-[image:var(--pimg-url-dark)]"
					>
						{#if !(p.imageDark ?? p.image)}<ImageSolid class="size-16 text-gray-900 dark:text-white" />{/if}
					</div>
				</div>
				<div class="py-4">
					<Heading tag="h3" class="text-center whitespace-nowrap text-xl lg:text-3xl">{p.name}</Heading>
				</div>
			</a>
		{/each}
	</div>
</section>