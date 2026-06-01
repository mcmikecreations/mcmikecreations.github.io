<script lang="ts">
	import { page } from '$app/state';
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import AppMeta from '$lib/components/AppMeta.svelte';
	import AppBreadcrumbs from '$lib/components/AppBreadcrumbs.svelte';
	import BlogSearchBar from '$lib/blog/BlogSearchBar.svelte';
	import { Badge, Heading, Img, Span } from 'flowbite-svelte';
	import DateBadge from '$lib/components/DateBadge.svelte';
	import { normalize } from '$lib/hikes/search-normalize';
	import type { SearchEntry } from '../search-index.json/+server';

	let index: SearchEntry[] | null = $state(null);
	let query = $state('');

	$effect(() => {
		if (!browser) return;
		query = page.url.searchParams.get('q') ?? '';
	});

	let results = $state<SearchEntry[]>([]);

	function score(entry: SearchEntry, nq: string): number {
		const full = (s: string) => normalize(s) === nq;
		const partial = (s: string) => !full(s) && normalize(s).includes(nq);

		const fullTitle = full(entry.title);
		const fullTag = entry.tags.some(t => full(t));
		const fullDesc = full(entry.description);
		const partialTitle = !fullTitle && partial(entry.title);
		const partialTag = !fullTag && entry.tags.some(t => partial(t));
		const partialDesc = !fullDesc && partial(entry.description);

		return (
			(fullTitle ? 10000 : 0) +
			(fullTag ? 5000 : 0) +
			(fullDesc ? 3000 : 0) +
			(partialTitle ? 100 : 0) +
			(partialTag ? 40 : 0) +
			(partialDesc ? 1 : 0)
		);
	}

	$effect(() => {
		if (!index || !query) {
			results = [];
			return;
		}
		const nq = normalize(query);
		results = index
			.map(e => ({ entry: e, s: score(e, nq) }))
			.filter(x => x.s > 0)
			.sort((a, b) => b.s - a.s || b.entry.date.localeCompare(a.entry.date))
			.map(x => x.entry);
	});

	onMount(async () => {
		const res = await fetch('/blog/search-index.json');
		index = await res.json();
	});
</script>

<AppMeta
	title={query ? `Search: ${query} | Blog` : 'Search Blog'}
	description="Search programming blog posts"
	shouldIndex={false}
/>
<AppBreadcrumbs
	items={[
		{ name: 'Home', href: '/' },
		{ name: 'Blog', href: '/blog/' },
		{ name: 'Search', href: '/blog/search/' },
	]}
/>

<main class="container mx-auto my-8 px-4 md:px-28 2xl:px-0">
	<Heading tag="h1" class="mb-6">Search Blog</Heading>

	<BlogSearchBar class="mb-8 w-full max-w-lg [&_input]:flex-1 [&_input]:w-full" />

	{#if !query}
		<p class="text-gray-500 dark:text-gray-400">Enter a query to search blog posts.</p>
	{:else if index === null}
		<p class="text-gray-500 dark:text-gray-400">Loading…</p>
	{:else if results.length === 0}
		<p class="text-gray-500 dark:text-gray-400">No results for <strong>{query}</strong>.</p>
	{:else}
		<p class="mb-6 text-sm text-gray-500 dark:text-gray-400">
			{results.length} result{results.length === 1 ? '' : 's'} for <strong>{query}</strong>
		</p>

		<div class="flex flex-col gap-6">
			{#each results as r}
				<div
					class="flex flex-col md:flex-row w-full rounded-lg shadow-lg bg-white dark:bg-gray-800 relative z-0 text-gray-500 dark:text-gray-400 group hover:shadow-xl transition-shadow duration-200"
				>
					<a href={r.url} class="absolute inset-0 z-10 block" aria-label={r.title}></a>

					{#if r.image}
						<div
							class="block md:max-h-40 md:min-h-40 md:min-w-56 !aspect-crt overflow-hidden rounded-t-lg md:rounded-tr-none md:rounded-l-lg"
						>
							<Img
								src={r.image}
								class="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
							/>
						</div>
					{/if}

					<div class="flex-grow flex flex-col p-4">
						<Heading
							tag="h3"
							class="group-hover:text-primary-600 dark:group-hover:text-primary-500 transition-colors"
						>
							{r.title}
						</Heading>
						<Span class="flex-grow pt-2 line-clamp-2">{r.description}</Span>
						<div class="pt-3 w-full flex flex-row items-center">
							<div class="relative z-20">
								<DateBadge date={new Date(r.date)} dateEnd={undefined} />
							</div>
							<div class="flex-grow flex flex-row justify-end gap-2 relative z-20 flex-wrap">
								{#each r.tags as t}
									<a href={`/blog/tag/${encodeURIComponent(t)}/`}>
										<Badge
											class="cursor-pointer hover:bg-primary-200 dark:hover:bg-primary-800 transition-colors"
										>{t}</Badge>
									</a>
								{/each}
							</div>
						</div>
					</div>
				</div>
			{/each}
		</div>
	{/if}
</main>
