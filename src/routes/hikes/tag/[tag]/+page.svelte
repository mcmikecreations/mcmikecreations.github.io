<script lang="ts">
	import { Heading } from 'flowbite-svelte';
	import AppMeta from '$lib/components/AppMeta.svelte';
	import type { PageData } from './$types';
	import HikeTagPage from '../../components/HikeTagPage.svelte';
	import HikesWeb from '../../components/HikesWeb.svelte';

	interface Props {
			data: PageData;
	}

	let { data }: Props = $props();
	let posts = $derived(data.posts);
	let pagination = $derived(data.pagination);
	let showPeople = $derived(data.showPeople);
	let tag = $derived(data.tag);
</script>


{#if tag === 'Web'}
	<HikeTagPage {posts} {pagination} {showPeople} {tag}>
		<HikesWeb />
	</HikeTagPage>
{:else if tag === 'Climb'}
	<AppMeta
		title={`Via Ferrata Adventures | Steep Routes and Climbing Sections"`}
		description={`Browse hiking blog posts tagged with ${tag}`}
		type="website"
	/>

	<HikeTagPage {posts} {pagination} {showPeople} {tag}>
		<Heading tag="h2" class="mb-2">Via Ferrata Adventures: Steep Routes and Climbing Sections</Heading>
		<p class="mb-8 text-gray-600 dark:text-gray-300">
			Posts tagged <span class="font-medium">{tag}</span> highlight
			elevation-heavy routes with significant via ferrata climbing sections.
		</p>
	</HikeTagPage>
{:else}
	<AppMeta
		title={`Hikes tagged "${tag} | Personal Hike Experiences"`}
		description={`Browse hiking blog posts tagged with ${tag}`}
		type="website"
	/>

	<HikeTagPage {posts} {pagination} {showPeople} {tag} />
{/if}
