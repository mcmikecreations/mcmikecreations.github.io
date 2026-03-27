<script lang="ts">
    import AppFooter from "$lib/components/AppFooter.svelte";
    import { Heading, A } from 'flowbite-svelte';
    import { ArrowLeftOutline } from 'flowbite-svelte-icons';
    import HikeList from '../../components/HikeList.svelte';
    import CustomPagination from '../../components/CustomPagination.svelte';
    import AppMeta from '$lib/components/AppMeta.svelte';
    import type { PageData } from './$types';
		import Feeds from '../../components/Feeds.svelte';
		import YearsNav from '../../components/YearsNav.svelte';

    interface Props {
        data: PageData;
    }

    let { data }: Props = $props();
    let posts = $derived(data.posts);
    let yearList = $derived(data.yearList);
    let pagination = $derived(data.pagination);
    let showPeople = $derived(data.showPeople);
    let year = $derived(data.year);
</script>

<AppMeta
	title={`Hikes from ${year} | Personal Hike Experiences`}
	description={`Browse hiking blog posts from ${year}`}
	type="website"
/>


<div class="h-[60px] md:h-[72px] bg-white dark:bg-gray-800 mb-8"></div>

<section class="container mx-auto mb-8">
	<div class="mx-4 2xl:mx-0 md:px-24 mb-8">
		<div class="mb-6">
			<A href="/hikes" class="inline-flex items-center">
				<ArrowLeftOutline class="w-5 h-5 me-2" />
				Back to All Hikes
			</A>
		</div>
		<Heading tag="h2" class="mb-8">Hikes from {year}</Heading>
		<div class="mt-8">
			<YearsNav years={yearList} />
		</div>
		<div class="mt-8">
			<HikeList {posts} {showPeople} />
			<CustomPagination
				currentPage={pagination.currentPage}
				totalPages={pagination.totalPages}
				baseUrl={`/hikes/year/${year}`}
			/>
		</div>
	</div>
</section>

<Feeds />
