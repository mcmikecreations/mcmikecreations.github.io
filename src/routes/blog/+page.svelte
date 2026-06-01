<script lang="ts">
	import type { PageData } from './$types';
	import { Button, Heading } from 'flowbite-svelte';
	import { tags } from '$lib/data/blog-info';
	import AppMeta from '$lib/components/AppMeta.svelte';
	import AppBreadcrumbs from '$lib/components/AppBreadcrumbs.svelte';
	import BlogJsonLd from './components/BlogJsonLd.svelte';
	import BlogPostList from './components/BlogPostList.svelte';
	import BlogPagination from './components/BlogPagination.svelte';
	import BlogFeeds from './components/BlogFeeds.svelte';
	import BlogSearchBar from '$lib/blog/BlogSearchBar.svelte';
	import { BLOG_TITLE, BLOG_DESCRIPTION } from '$lib/blog/blog-meta';
	import resume from '$lib/data/resume.json';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();
</script>

<AppBreadcrumbs items={[{ name: 'Home', href: '/' }, { name: 'Blog', href: '/blog/' }]} />
<BlogJsonLd variant="blog" posts={data.posts} currentPage={1} totalPages={data.pagination.totalPages} />
<AppMeta
	title={BLOG_TITLE}
	description={BLOG_DESCRIPTION}
	type="website"
	article-author={resume.basics.name}
	article-section="Programming"
/>

<div class="grid grid-cols-1 sm:grid-cols-4 gap-4 mx-4 2xl:mx-0">
	<aside class="ms-4 sm:ms-0 flex flex-col gap-4">
		<div>
			<BlogSearchBar class="w-full" />
		</div>

		<div>
			<Heading tag="h3" class="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">By Year</Heading>
			<div class="flex flex-row flex-wrap gap-3">
				{#each data.yearList as year}
					<a
						href={`/blog/year/${year}/`}
						class="px-3 py-1 rounded-full text-sm font-medium border transition-colors
							bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-600
							hover:border-primary-500 hover:text-primary-600 dark:hover:text-primary-400"
					>{year}</a>
				{/each}
			</div>
		</div>

		<div>
			<Heading tag="h3" class="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">By Tag</Heading>
			<div class="flex flex-row flex-wrap gap-3">
				<Button
					class="inline-block"
					color="alternative"
					size="sm"
					href="/hikes/"
				>Hikes</Button>
				{#each tags as tag}
					<Button
						class="inline-block"
						color="alternative"
						size="sm"
						href={`/blog/tag/${encodeURIComponent(tag)}/`}
					>{tag}</Button>
				{/each}
			</div>
		</div>
	</aside>

	<!-- Actual posts -->
	<main class="col-span-1 sm:col-span-3 xl:col-span-2">
		<BlogPostList posts={data.posts} />
		<BlogPagination
			currentPage={data.pagination.currentPage}
			totalPages={data.pagination.totalPages}
			baseUrl="/blog"
		/>
	</main>
</div>

<BlogFeeds />
