<script lang="ts">
	import { A, Heading } from 'flowbite-svelte';
	import { ArrowLeftOutline } from 'flowbite-svelte-icons';
	import AppMeta from '$lib/components/AppMeta.svelte';
	import AppBreadcrumbs from '$lib/components/AppBreadcrumbs.svelte';
	import BlogJsonLd from '../../components/BlogJsonLd.svelte';
	import BlogPostList from '../../components/BlogPostList.svelte';
	import BlogPagination from '../../components/BlogPagination.svelte';
	import BlogFeeds from '../../components/BlogFeeds.svelte';
	import { blogListTitle, blogListDescription } from '$lib/blog/blog-meta';
	import resume from '$lib/data/resume.json';
	import type { PageData } from './$types';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();
	let posts = $derived(data.posts);
	let pagination = $derived(data.pagination);
</script>

<AppMeta
	title={blogListTitle(pagination.currentPage)}
	description={blogListDescription(pagination.currentPage)}
	type="website"
	article-author={resume.basics.name}
	article-section="Programming"
/>
<BlogJsonLd variant="list" {posts} currentPage={pagination.currentPage} />
<AppBreadcrumbs items={[
	{ name: 'Home', href: '/' },
	{ name: 'Blog', href: '/blog/' },
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
		<Heading tag="h2" class="mb-8">All Posts — Page {pagination.currentPage}</Heading>
		<div class="mt-8">
			<BlogPostList {posts} />
			<BlogPagination
				currentPage={pagination.currentPage}
				totalPages={pagination.totalPages}
				baseUrl="/blog"
			/>
		</div>
	</div>
</section>

<BlogFeeds />
