<script lang="ts">
	import { Heading } from 'flowbite-svelte';
	import AppMeta from '$lib/components/AppMeta.svelte';
	import type { PageData } from './$types';
	import HikeTagPage from '../../components/HikeTagPage.svelte';
	import HikesWeb from '../../components/HikesWeb.svelte';
	import HikeJsonLd from '../../components/HikeJsonLd.svelte';
	import {
		hikesTagTitle,
		hikesTagDescription,
		HIKES_TAG_WEB_TITLE,
		HIKES_TAG_WEB_DESCRIPTION,
		HIKES_TAG_CLIMB_TITLE
	} from '$lib/hikes/hikes-meta';
	import resume from '$lib/data/resume.json';
	import AppBreadcrumbs from '$lib/components/AppBreadcrumbs.svelte';

	interface Props {
			data: PageData;
	}

	let { data }: Props = $props();
	let posts = $derived(data.posts);
	let pagination = $derived(data.pagination);
	let showPeople = $derived(data.showPeople);
	let tag = $derived(data.tag);

	const TAG_OVERRIDES: Record<string, { name: string; description?: string; breadcrumb: string }> = {
		Web: { name: HIKES_TAG_WEB_TITLE, description: HIKES_TAG_WEB_DESCRIPTION, breadcrumb: 'Hiking Web' },
		Climb: { name: HIKES_TAG_CLIMB_TITLE, breadcrumb: 'Via Ferrata' }
	};

	let tagOverride = $derived(TAG_OVERRIDES[tag]);
	let jsonLdName = $derived(tagOverride?.name);
	let jsonLdDescription = $derived(tagOverride?.description);
	let breadcrumbName = $derived(tagOverride?.breadcrumb ?? tag);
	let appMetaTitle = $derived(tagOverride?.name ?? hikesTagTitle(tag, pagination.currentPage));
	let appMetaDescription = $derived(tagOverride?.description ?? hikesTagDescription(tag, pagination.currentPage));
</script>

<AppMeta
	title={appMetaTitle}
	description={appMetaDescription}
	type="website"
	article-author={resume.basics.name}
	article-section="Hikes"
/>
<HikeJsonLd variant="tag" {tag} {posts} currentPage={pagination.currentPage} totalPages={pagination.totalPages} name={jsonLdName} description={jsonLdDescription} />
<AppBreadcrumbs items={[
	{ name: 'Home', href: '/' },
	{ name: 'Hikes', href: '/hikes/' },
	{ name: breadcrumbName, href: `/hikes/tag/${encodeURIComponent(tag)}/` }
]} />

{#if tag === 'Web'}
	<HikeTagPage {posts} {pagination} {showPeople} {tag}>
		<HikesWeb />
	</HikeTagPage>
{:else if tag === 'Climb'}
	<HikeTagPage {posts} {pagination} {showPeople} {tag}>
		<Heading tag="h2" class="mb-2">Via Ferrata Adventures: Steep Routes and Climbing Sections</Heading>
		<p class="mb-8 text-gray-600 dark:text-gray-300">
			Posts tagged <span class="font-medium">{tag}</span> highlight
			elevation-heavy routes with significant via ferrata climbing sections.
		</p>
	</HikeTagPage>
{:else}
	<HikeTagPage {posts} {pagination} {showPeople} {tag} />
{/if}
