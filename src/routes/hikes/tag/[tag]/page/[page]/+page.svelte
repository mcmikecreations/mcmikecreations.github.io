<script lang="ts">
	import AppMeta from '$lib/components/AppMeta.svelte';
	import type { PageData } from './$types';
	import HikeTagPage from '../../../../components/HikeTagPage.svelte';

    interface Props {
        data: PageData;
    }

    let { data }: Props = $props();
    let posts = $derived(data.posts);
    let pagination = $derived(data.pagination);
    let showPeople = $derived(data.showPeople);
    let tag = $derived(data.tag);
</script>

<AppMeta
	title={`Hikes tagged "${tag}" - Page ${pagination.currentPage} | Personal Hike Experiences`}
	description={`Browse hiking blog posts tagged with ${tag} - Page ${pagination.currentPage}`}
	type="website"
/>

<HikeTagPage {posts} {pagination} {showPeople} {tag} />
