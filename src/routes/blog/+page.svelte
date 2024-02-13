<script lang="ts">
	import type { PageData } from './$types';
	import { List, Li, A, AccordionItem, Accordion, Button } from 'flowbite-svelte';
	import { tags } from '$lib/data/blogInfo';
	import { onMount } from 'svelte';

	export let data: PageData;

	let posts = data.posts;

	const years = new Set(data.posts.map(p => p.year.toString()));
	type ToggleParam = (value : string) => void;
	let toggleTag : ToggleParam;
	let toggleYear : ToggleParam;
	let selectedTags : string[];
	let selectedYear : string | null;

	onMount(() => {
		const url = window.location;
		const params = new URLSearchParams(url.search);
		const selectedTagsKey = 'tags';
		const selectedYearKey = 'year';
		selectedTags = params.getAll(selectedTagsKey);
		selectedYear = params.get(selectedYearKey);

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

			window.location.search = params.toString();
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

			window.location.search = params.toString();
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
	<div class="col-span-3">
		<List tag="ul" list="none">
			{#each posts as post}
				<Li>
					<A href={post.url}>{post.title}</A>
				</Li>
			{/each}
		</List>
	</div>
</div>
