<script lang="ts">
	/* eslint-disable svelte/no-at-html-tags */
	import type { PageData } from './$types';
	import {
		A,
		AccordionItem,
		Accordion,
		Button,
		Heading,
		Span,
		Img,
		Pagination,
		type LinkType,
		Badge, type PaginationItemProps
	} from 'flowbite-svelte';
	import { tags } from '$lib/data/blog-info';
	import { onMount } from 'svelte';
	import { ChevronLeftOutline, ChevronRightOutline, ImageSolid } from 'flowbite-svelte-icons';
	import DateBadge from '$lib/components/DateBadge.svelte';
	import AppMeta from '$lib/components/AppMeta.svelte';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();

	let posts = $state(data.posts);

	const baseTitle = 'Blog';
	let title = $state(baseTitle);

	const postsPerPage = 5;
	const years = new Set(data.posts.map(p => p.year.toString()));
	type ToggleParam = (value : string) => void;
	let toggleTag : ToggleParam = $state(() => {});
	let toggleYear : ToggleParam = $state(() => {});
	let togglePage : (isNext : boolean) => void = $state(() => {});
	let clickPage : (e : MouseEvent) => void = $state(() => {});
	let selectedTags : string[] = $state([]);
	let selectedYear : string | null = $state(null);
	let selectedPage : number = $state(1);
	let pageCount = $derived(Math.ceil(posts.length / postsPerPage));
	let pages : PaginationItemProps[] = $state([]);

	function filterPosts() : void {
		const newPosts = data.posts.filter(x => {
			if (selectedTags.length !== 0 && selectedTags.filter(y => x.tags.includes(y)).length !== selectedTags.length) {
				return false;
			}

			return !(selectedYear !== null && x.year.toString() !== selectedYear);
		});

		pageCount = Math.ceil(newPosts.length / postsPerPage);
		pages = [...Array(pageCount).keys()].map(x => {
			return {
				name: (x + 1).toString(),
				active: (x + 1) === selectedPage,
			};
		});
		posts = newPosts.slice((selectedPage - 1) * postsPerPage, selectedPage * postsPerPage);
	}

	onMount(() => {
		const selectedTagsKey = 'tags';
		const selectedYearKey = 'year';
		const selectedPageKey = 'page';
		let params : URLSearchParams;

		function updatePage() {
			const oldLocationString = window.location.toString();
			const location = new URL(oldLocationString);
			location.search = params.toString();
			const newLocationString = location.toString();
			title = baseTitle + ` ${location.search}`;

			if (oldLocationString !== newLocationString) {
				window.history.pushState({}, window.document.title, newLocationString);
			}

			selectedTags = params.getAll(selectedTagsKey);
			selectedYear = params.get(selectedYearKey);
			selectedPage = parseInt(params.get(selectedPageKey) ?? '1');

			filterPosts();
		}

		const url = window.location;
		params = new URLSearchParams(url.search);
		updatePage();

		toggleTag = function (tag : string) : void {
			if (params.has(selectedTagsKey)) {
				if (selectedTags.includes(tag)) {
					params.delete(selectedTagsKey, tag);
				} else {
					params.append(selectedTagsKey, tag);
				}
			} else {
				params.set(selectedTagsKey, tag);
			}

			updatePage();
		};

		toggleYear = function (year : string) : void {
			if (params.has(selectedYearKey)) {
				if (selectedYear == year) {
					params.delete(selectedYearKey, year);
				} else {
					params.set(selectedYearKey, year);
				}
			} else {
				params.set(selectedYearKey, year);
			}

			updatePage();
		};

		togglePage = function (isNext : boolean) : void {
			const page = isNext ? selectedPage + 1 : selectedPage - 1;

			if (page >= 1 && page <= pageCount) {
				alert('Toggled ' + page);
				params.set(selectedPageKey, page.toString());
				updatePage();
			}
		}

		clickPage = function (e : MouseEvent) : void {
			const page = parseInt((e.target as HTMLElement).innerText);

			if (isFinite(page) && page !== selectedPage) {
				alert('Clicked ' + page);
				params.set(selectedPageKey, page.toString());
				updatePage();
			}
		}
	});
</script>

<AppMeta
	title={title}
	description="Personal programming blog of Mykola Morozov"
	type="website"
/>

<div class="grid grid-cols-1 sm:grid-cols-4 gap-4 mx-4 2xl:mx-0">
	<aside class="ms-4 sm:ms-0">
		<Accordion multiple>
			<AccordionItem open>
				{#snippet header()}
								<span >By Year</span>
							{/snippet}
				<div class="flex flex-row flex-wrap gap-4">
					{#each years as year}
						{#if selectedYear === year}
							<A
								class="text-primary-600 dark:text-primary-500"
								onclick={() => toggleYear(year)}
							>{year}</A>
						{:else}
							<A
								class="text-gray-500 dark:text-gray-400"
								onclick={() => toggleYear(year)}
							>{year}</A>
						{/if}
					{/each}
				</div>
			</AccordionItem>
			<AccordionItem open>
				{#snippet header()}
								<span >By Tag</span>
							{/snippet}
				<div class="flex flex-row flex-wrap gap-4">
					{#each tags as tag}
						<Button
							class="inline-block"
							color={selectedTags?.includes(tag) ? 'primary' : 'alternative'}
							size="sm"
							onclick={() => toggleTag(tag)}
						>{tag}</Button>
					{/each}
				</div>
			</AccordionItem>
		</Accordion>
	</aside>

	<!-- Actual posts	-->
	<main class="col-span-1 sm:col-span-3 xl:col-span-2">
		<div class="flex flex-col gap-4">
			{#each posts as p}
				<a
					class="flex flex-col md:flex-row w-full md:min-h-48
					rounded-lg shadow-lg
					bg-white dark:bg-gray-800
 					text-gray-500 dark:text-gray-400"
					href={p.url}
					data-sveltekit-reload
				>
					<div class="relative block md:max-h-48 md:min-h-48 md:min-w-64 !aspect-crt overflow-hidden">
						<div class="w-full md:w-auto md:h-full aspect-crt flex justify-center items-center">
							<ImageSolid aria-hidden="true" class="w-16 h-16 text-gray-500 dark:text-gray-500" />
						</div>
						{#if p.image}
							<div class="absolute top-0 left-0 bottom-0 right-0">
								<Img src={p.image ?? undefined} class="w-full h-full aspect-crt rounded-lg object-cover object-center" />
							</div>
						{/if}
					</div>
					<div class="flex-grow flex flex-col p-4">
						<Heading tag="h3">{p.title}</Heading>
						<Span class="flex-grow pt-4">{@html p.description}</Span>
						<div class="pt-4 w-full flex flex-row">
							<DateBadge date={p.date} dateEnd={undefined} />
							<div class="flex-grow flex flex-row justify-end gap-2" aria-details="tags">
								<span aria-label="tags" class="sr-only"></span>
								{#each p.tags as t}
									<Badge>{t}</Badge>
								{/each}
							</div>
						</div>
					</div>
				</a>
			{/each}
		</div>
	</main>
</div>

<div class="flex flex-col justify-center items-center mt-4">
	{#snippet prevContent()}
		<span class="sr-only">Previous</span>
		<ChevronLeftOutline aria-hidden="true" class="size-4" />
	{/snippet}
	{#snippet nextContent()}
		<span class="sr-only">Next</span>
		<ChevronRightOutline aria-hidden="true" class="size-4" />
	{/snippet}
	<Pagination
		{pages}
		class="mx-auto"
		size="large"
		previous={() => togglePage(false)}
		next={() => togglePage(true)}
		onclick={clickPage}
		{prevContent}
		{nextContent}
	>
	</Pagination>
</div>
