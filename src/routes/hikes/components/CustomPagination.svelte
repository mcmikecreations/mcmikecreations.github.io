<script lang="ts">
  import { PaginationNav } from 'flowbite-svelte';
  import { ArrowLeftOutline, ArrowRightOutline } from 'flowbite-svelte-icons';
	import { goto } from '$app/navigation';

  interface Props {
    currentPage: number;
    totalPages: number;
    baseUrl: string;
  }

  let { currentPage, totalPages, baseUrl }: Props = $props();

  function getPageUrl(page: number) {
		const base = baseUrl.replace(/\/$/, '');
		return page === 1 ? (base || '/') : `${base}/page/${page}`;
  }

	async function handlePageChange(page: number) {
		// If page is an event object, we need to extract the page number
		if (typeof page === 'object' && page !== null && 'detail' in page) {
			// @ts-ignore
			page = page.detail.page;
		}

		currentPage = page;
		await goto(getPageUrl(page), {
			replaceState: true,
			noScroll: true,
			keepFocus: true,
		});
		scrollTo({ top: 0, behavior: 'smooth' });
	}
</script>

{#snippet prevContent()}
  <span class="sr-only">Previous</span>
  <ArrowLeftOutline class="h-5 w-5" />
{/snippet}

{#snippet nextContent()}
  <span class="sr-only">Next</span>
  <ArrowRightOutline class="h-5 w-5" />
{/snippet}

<div class="flex justify-center mt-8">
	<PaginationNav {currentPage} {totalPages} onPageChange={handlePageChange} {prevContent} {nextContent} />
</div>
