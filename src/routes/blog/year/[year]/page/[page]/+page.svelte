<script lang="ts">
	import { A, Heading } from 'flowbite-svelte';
	import { ArrowLeftOutline } from 'flowbite-svelte-icons';
	import AppMeta from '$lib/components/AppMeta.svelte';
	import AppBreadcrumbs from '$lib/components/AppBreadcrumbs.svelte';
	import BlogJsonLd from '../../../../components/BlogJsonLd.svelte';
	import BlogPostList from '../../../../components/BlogPostList.svelte';
	import BlogPagination from '../../../../components/BlogPagination.svelte';
	import BlogFeeds from '../../../../components/BlogFeeds.svelte';
	import { blogYearTitle, blogYearDescription } from '$lib/blog/blog-meta';
	import resume from '$lib/data/resume.json';
	import type { PageData } from './$types';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();
	let posts = $derived(data.posts);
	let pagination = $derived(data.pagination);
	let year = $derived(data.year);
	let yearList = $derived(data.yearList);
</script>

<AppMeta
	title={blogYearTitle(year, pagination.currentPage)}
	description={blogYearDescription(year, pagination.currentPage)}
	type="website"
	article-author={resume.basics.name}
	article-section="Programming"
/>
<BlogJsonLd variant="year" {year} {posts} currentPage={pagination.currentPage} totalPages={pagination.totalPages} />
<AppBreadcrumbs items={[
	{ name: 'Home', href: '/' },
	{ name: 'Blog', href: '/blog/' },
	{ name: String(year), href: `/blog/year/${year}/` },
	{ name: `Page ${pagination.currentPage}` },
]} />

<section class="container mx-auto mb-8">
	<div class="mx-4 2xl:mx-0 md:px-24 mb-8">
		<div class="mb-6">
			<A href="/blog/" class="inline-flex items-center">
				<ArrowLeftOutline class="w-5 h-5 me-2" />
				Back to All Posts
			</A>
		</div>
		<Heading tag="h2" class="mb-4">Posts from {year} — Page {pagination.currentPage}</Heading>

		<div class="flex flex-row flex-wrap gap-3 mb-8">
			{#each yearList as y}
				<a
					href={`/blog/year/${y}/`}
					class="px-3 py-1 rounded-full text-sm font-medium border transition-colors
						{y === year
							? 'bg-primary-600 text-white border-primary-600'
							: 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:border-primary-500 hover:text-primary-600 dark:hover:text-primary-400'}"
				>{y}</a>
			{/each}
		</div>

		<div class="mt-8">
			<BlogPostList {posts} />
			<BlogPagination
				currentPage={pagination.currentPage}
				totalPages={pagination.totalPages}
				baseUrl={`/blog/year/${year}`}
			/>
		</div>
	</div>
</section>

<BlogFeeds />
