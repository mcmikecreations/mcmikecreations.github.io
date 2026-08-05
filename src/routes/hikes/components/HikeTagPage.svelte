<script lang="ts">
	import { A, Heading } from 'flowbite-svelte';
	import { ArrowLeftOutline } from 'flowbite-svelte-icons';
	import type { Snippet } from 'svelte';
	import type { ProcessedPost } from '$lib/hikes/hikes-info';
	import HikeList from './HikeList.svelte';
	import CustomPagination from './CustomPagination.svelte';
	import Feeds from './Feeds.svelte';

	interface Pagination {
		currentPage: number;
		totalPages: number;
	}

	interface Props {
		posts: ProcessedPost[];
		pagination: Pagination;
		showPeople?: boolean;
		tag: string;
		children?: Snippet;
	}

	let { posts, pagination, showPeople = false, tag, children }: Props = $props();
</script>

<div class="h-[60px] md:h-[72px] bg-white dark:bg-gray-800 mb-8"></div>

<section class="container mx-auto mb-8">
	<div class="mx-4 2xl:mx-0 md:px-24 mb-8">
		<div class="mb-6">
			<A href="/hikes/#projects" class="inline-flex items-center">
				<ArrowLeftOutline class="w-5 h-5 me-2" />
				Back to All Hikes
			</A>
		</div>

		{#if children}
			{@render children()}
		{:else if pagination.currentPage > 1}
			<Heading tag="h2" class="mb-8">{tag} - Page {pagination.currentPage}</Heading>
		{:else}
			<Heading tag="h2" class="mb-8">
				Hikes Tagged: <span class="text-primary-600 dark:text-primary-500">{tag}</span>
			</Heading>
		{/if}

		<div class="mt-8">
			<HikeList {posts} {showPeople} />
			<CustomPagination
				currentPage={pagination.currentPage}
				totalPages={pagination.totalPages}
				baseUrl={`/hikes/tag/${encodeURIComponent(tag)}`}
			/>
		</div>
	</div>
</section>

<Feeds />

