<script>
	/* eslint-disable svelte/no-at-html-tags */
	import resume from '$lib/data/resume.json';
	import { GlobeSolid } from 'flowbite-svelte-icons';
	import ProjectImage from '$lib/components/ProjectImage.svelte';

const projects = resume.projects;
</script>

<main class="md:px-24">
	{#each projects as p}
		<article class="flex flex-row flex-wrap lg:flex-nowrap gap-4 mx-4 2xl:mx-0 mb-8">
			<div class="flex-1">
				<a href={p.route}><ProjectImage {p} class="size-80 mx-auto" /></a>
			</div>
			<div class="flex-grow prose dark:prose-invert prose-a:text-primary-600 dark:prose-a:text-primary-500 md:prose-lg lg:prose-xl max-w-none">
				<a href={p.route}>
					<h2 class="!mt-0">
						<span class="inline-flex justify-center items-center">
							{p.name}
							{#if p.url}<a href={p.url} class="ps-2" target="_blank"><GlobeSolid size="xl" class="inline" /></a>{/if}
						</span>
					</h2>
				</a>
				<blockquote>{@html p.quote}</blockquote>
				<p>
					{@html p.description}
				</p>
			</div>
		</article>
	{/each}
</main>