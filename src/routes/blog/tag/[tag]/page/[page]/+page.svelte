<script lang="ts">
	import { A, Heading } from 'flowbite-svelte';
	import { ArrowLeftOutline } from 'flowbite-svelte-icons';
	import AppMeta from '$lib/components/AppMeta.svelte';
	import AppBreadcrumbs from '$lib/components/AppBreadcrumbs.svelte';
	import BlogJsonLd from '../../../../components/BlogJsonLd.svelte';
	import BlogPostList from '../../../../components/BlogPostList.svelte';
	import BlogPagination from '../../../../components/BlogPagination.svelte';
	import BlogFeeds from '../../../../components/BlogFeeds.svelte';
	import { blogTagTitle, blogTagDescription } from '$lib/blog/blog-meta';
	import resume from '$lib/data/resume.json';
	import type { PageData } from './$types';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();
	let posts = $derived(data.posts);
	let pagination = $derived(data.pagination);
	let tag = $derived(data.tag);
</script>

<AppMeta
	title={blogTagTitle(tag, pagination.currentPage)}
	description={blogTagDescription(tag, pagination.currentPage)}
	type="website"
	article-author={resume.basics.name}
	article-section="Programming"
/>
<BlogJsonLd variant="tag" {tag} {posts} currentPage={pagination.currentPage} totalPages={pagination.totalPages} />
<AppBreadcrumbs items={[
	{ name: 'Home', href: '/' },
	{ name: 'Blog', href: '/blog/' },
	{ name: tag, href: `/blog/tag/${encodeURIComponent(tag)}/` },
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
		<Heading tag="h2" class="mb-8">
			Posts Tagged: <span class="text-primary-600 dark:text-primary-500">{tag}</span> — Page {pagination.currentPage}
		</Heading>
		<div class="mt-8">
			<BlogPostList {posts} />
			<BlogPagination
				currentPage={pagination.currentPage}
				totalPages={pagination.totalPages}
				baseUrl={`/blog/tag/${encodeURIComponent(tag)}`}
			/>
		</div>
	</div>
</section>

<BlogFeeds />
