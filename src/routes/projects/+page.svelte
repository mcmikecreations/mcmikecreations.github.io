<script>
	/* eslint-disable svelte/no-at-html-tags */
	import resume from '$lib/data/resume.json';
	import { GlobeSolid } from 'flowbite-svelte-icons';
	import ProjectImage from '$lib/components/ProjectImage.svelte';
	import AppMeta from '$lib/components/AppMeta.svelte';
	import AppBreadcrumbs from '$lib/components/AppBreadcrumbs.svelte';
	import AppJsonLd from '$lib/components/AppJsonLd.svelte';

const projects = resume.projects;
</script>

<AppMeta title="Projects" description="Various projects I have developed" type="website" />
<AppBreadcrumbs items={[{ name: 'Home', href: '/' }, { name: 'Projects', href: '/projects/' }]} />
<AppJsonLd variant="collection" name="Projects" description="Various projects I have developed" url="/projects/" items={projects.map(p => ({ name: p.name, url: p.route, image: p.image }))} />

<main>
	{#each projects as p}
		<article class="flex flex-row flex-wrap lg:flex-nowrap gap-4 mx-4 2xl:mx-0 mb-8">
			<div class="flex-1">
				<a href={p.route} aria-label="{p.name} website image"><ProjectImage {p} class="size-80 mx-auto" /></a>
			</div>
			<div class="flex-grow prose dark:prose-invert prose-a:text-primary-600 dark:prose-a:text-primary-500 md:prose-lg lg:prose-xl max-w-none">
				<h2 class="!my-0">
					<span class="inline-flex justify-center items-center">
						<a
							href={p.route}
							class="inline-flex justify-center items-center font-bold leading-[1.3333333] text-[1.5rem] !text-[var(--tw-prose-headings)] no-underline"
						>
							{p.name}
						</a>
						{#if p.url}<a href={p.url} class="ps-2" target="_blank"><GlobeSolid size="xl" class="inline" ariaLabel="website" /></a>{/if}
					</span>
				</h2>
				<blockquote>{@html p.quote}</blockquote>
				<p>
					{@html p.description}
				</p>
			</div>
		</article>
	{/each}
</main>