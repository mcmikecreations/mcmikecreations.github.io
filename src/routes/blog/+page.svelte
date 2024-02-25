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
		Badge
	} from 'flowbite-svelte';
	import { tags } from '$lib/data/blogInfo';
	import { onMount } from 'svelte';
	import { CalendarMonthSolid, ChevronLeftOutline, ChevronRightOutline, ImageSolid } from 'flowbite-svelte-icons';
	import AppTitle from '$lib/components/AppTitle.svelte';
	import DateBadge from '$lib/components/DateBadge.svelte';

	export let data: PageData;

	let posts = data.posts;

	const baseTitle = 'Blog';
	let title = baseTitle;

	const postsPerPage = 5;
	const years = new Set(data.posts.map(p => p.year.toString()));
	type ToggleParam = (value : string) => void;
	let toggleTag : ToggleParam;
	let toggleYear : ToggleParam;
	let togglePage : (e : CustomEvent) => void;
	let clickPage : (e : MouseEvent) => void;
	let selectedTags : string[];
	let selectedYear : string | null;
	let selectedPage : number = 1;
	let pageCount = Math.ceil(posts.length / postsPerPage);
	let pages : LinkType[];

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

		togglePage = function (e : CustomEvent) : void {
			const page = e.type === 'previous' ? selectedPage - 1 : selectedPage + 1;

			if (page >= 1 && page <= pageCount) {
				params.set(selectedPageKey, page.toString());
				updatePage();
			}
		}

		clickPage = function (e : MouseEvent) : void {
			const page = parseInt((e.target as HTMLElement).innerText);

			if (page !== selectedPage) {
				params.set(selectedPageKey, page.toString());
				updatePage();
			}
		}
	});
</script>

<AppTitle {title} />

<div class="grid grid-cols-1 sm:grid-cols-4 gap-4 mx-4 2xl:mx-0">
	<aside class="ms-4 sm:ms-0">
		<Accordion multiple>
			<AccordionItem open>
				<span slot="header">By Year</span>
				<div class="flex flex-row flex-wrap gap-4">
					{#each years as year}
						<A
							class={selectedYear === year ? 'text-primary-600 dark:text-primary-500' : 'text-alternative-600 dark:text-alternative-500'}
							on:click={() => toggleYear(year)}
						>{year}</A>
					{/each}
				</div>
			</AccordionItem>
			<AccordionItem open>
				<span slot="header">By Tag</span>
				<div class="flex flex-row flex-wrap gap-4">
					{#each tags as tag}
						<Button
							class="inline-block"
							color={selectedTags?.includes(tag) ? 'primary' : 'alternative'}
							size="sm"
							on:click={() => toggleTag(tag)}
						>{tag}</Button>
					{/each}
				</div>
			</AccordionItem>
		</Accordion>
	</aside>

	<!-- Actual posts	-->
	<main class="col-span-2 md:col-span-3 lg:col-span-2">
		<div class="flex flex-col gap-4">
			{#each posts as p}
				<a
					class="flex flex-col md:flex-row w-full md:min-h-48 rounded-lg shadow-lg bg-white dark:bg-gray-800"
					href={p.url}
				>
					<div class="relative block md:max-h-48 md:min-h-48 md:min-w-64 !aspect-crt overflow-hidden">
						<div class="w-full md:w-auto md:h-full aspect-crt flex justify-center items-center">
							<ImageSolid class="w-16 h-16 text-gray-500 dark:text-gray-500" />
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
							<DateBadge date={p.date} />
							<div class="flex-grow flex flex-row justify-end gap-2">
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
	<Pagination
		{pages}
		class="mx-auto"
		large
		icon
		on:previous={togglePage}
		on:next={togglePage}
		on:click={clickPage}
	>
		<svelte:fragment slot="prev">
			<span class="sr-only">Previous</span>
			<ChevronLeftOutline class="size-4" />
		</svelte:fragment>
		<svelte:fragment slot="next">
			<span class="sr-only">Next</span>
			<ChevronRightOutline class="size-4" />
		</svelte:fragment>
	</Pagination>
</div>
