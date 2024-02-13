<script lang="ts">
	/* eslint-disable svelte/no-at-html-tags */
	import type { PageData } from './$types';
	import { A, AccordionItem, Accordion, Button, Heading, Span, Img } from 'flowbite-svelte';
	import { tags } from '$lib/data/blogInfo';
	import { onMount } from 'svelte';
	import { CalendarMonthSolid, ImageSolid } from 'flowbite-svelte-icons';

	export let data: PageData;

	let posts = data.posts;

	const years = new Set(data.posts.map(p => p.year.toString()));
	type ToggleParam = (value : string) => void;
	let toggleTag : ToggleParam;
	let toggleYear : ToggleParam;
	let selectedTags : string[];
	let selectedYear : string | null;

	function filterPosts() : void {
		posts = data.posts.filter(x => {
			if (selectedTags.length !== 0 && selectedTags.filter(y => x.tags.includes(y)).length !== selectedTags.length) {
				return false;
			}

			return !(selectedYear !== null && x.year.toString() !== selectedYear);
		});
	}

	onMount(() => {
		const selectedTagsKey = 'tags';
		const selectedYearKey = 'year';
		let params : URLSearchParams;

		function updatePage() {
			const location = new URL(window.location.toString());
			location.search = params.toString();
			window.document.title = location.toString();

			window.history.pushState({}, window.document.title, location.toString());

			selectedTags = params.getAll(selectedTagsKey);
			selectedYear = params.get(selectedYearKey);

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
	});
</script>

<div class="grid grid-cols-4 gap-4">
	<div>
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
	</div>

<!-- Actual posts	-->
	<div class="col-span-2">
		<div class="flex flex-col gap-4">
			{#each posts as p}
				<a
					class="flex w-full flex-col md:flex-row rounded-lg shadow-lg bg-white dark:bg-gray-800"
					href={p.url}
				>
					<div class="relative block h-full aspect-crt object-cover">
						<div class="h-full aspect-crt flex justify-center items-center">
							<ImageSolid class="w-16 h-16 text-gray-500 dark:text-gray-500" />
						</div>
						{#if p.image}
							<div class="absolute top-0 left-0 bottom-0 right-0">
								<Img src={p.image ?? undefined} class="w-full h-full aspect-crt rounded-t-lg object-cover object-center" />
							</div>
						{/if}
					</div>
					<div class="flex-grow flex flex-col p-4">
						<Heading tag="h3">{p.title}</Heading>
						<Span class="flex-grow pt-4">{@html p.description}</Span>
						<div class="pt-4 w-full">
							<CalendarMonthSolid class="inline-block w-4 h-4 text-gray-900 dark:text-white align-middle" />
							<Span class="align-text-top">{`${p.year.toString().padStart(4,'0')}/${p.month.toString().padStart(2,'0')}/${p.day.toString().padStart(2,'0')}`}</Span>
						</div>
					</div>
				</a>
			{/each}
		</div>
	</div>
</div>
