<script lang="ts">
	import { page } from '$app/stores';
	import Toc from 'svelte-toc';
	import { Span } from 'flowbite-svelte';
	import { BarsFromLeftSolid } from 'flowbite-svelte-icons';

	$: enabled = $page.data.toc?.enabled ?? false;

	let nav : HTMLElement | undefined;
	$: if (nav) {
		if (!nav.classList.contains('tw-toc')) {
			nav.classList.add('tw-toc',
				'bg-gray-50', 'border-gray-100',
				'dark:bg-gray-800', 'dark:border-gray-700',
				'rounded-lg', 'border', '!pb-4',
				'border-gray-100', 'dark:border-gray-700',
				'divide-gray-100', 'dark:divide-gray-700');
		}
	}
</script>

<div class={enabled ? '' : 'hidden'}>
	<Toc
		bind:nav={nav}
		minItems={2}
		--toc-mobile-btn-padding="0"
		--toc-active-bg="transparent"
	>
		<span let:heading slot="toc-item" class="
			block rounded
			py-0.5 pe-4 ps-3 md:p-0
			font-medium">
    	{heading.textContent}
		</span>
		<Span slot="title" class="
			font-medium
			">
			On this page:
		</Span>
		<div slot="open-toc-icon" class="
			text-gray-500 dark:text-gray-400
			hover:bg-gray-100 dark:hover:bg-gray-700
			focus:outline-none focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-700
			rounded-lg text-sm p-2.5">
			<BarsFromLeftSolid class="size-5" />
		</div>
	</Toc>
</div>

<style>
	:global(html.dark nav.tw-toc>ol>li:not(.active)) {
		@apply text-gray-400 focus-within:text-white hover:text-white
			bg-transparent
			focus-within:ring-4 focus-within:outline-none
			focus-within:ring-gray-700 rounded-lg;
	}
	:global(html:not(.dark) nav.tw-toc>ol>li:not(.active)) {
		@apply text-gray-900 hover:text-primary-700 focus-within:text-primary-700
    	bg-transparent hover:bg-gray-100
			focus-within:ring-4 focus-within:outline-none
			focus-within:ring-gray-200 rounded-lg;
	}
	:global(nav.tw-toc>ol>li.active) {
		@apply text-white
			bg-primary-700 hover:bg-primary-800 dark:bg-primary-600 dark:hover:bg-primary-700
    	focus-within:ring-4 focus-within:outline-none
    	focus-within:ring-primary-300 dark:focus-within:ring-primary-800 rounded-lg;
  }
</style>
