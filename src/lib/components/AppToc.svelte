<script lang="ts">
	import { page } from '$app/state';
	import { Span } from 'flowbite-svelte';
	import Toc from 'svelte-toc';
	import { BarsFromLeftOutline } from 'flowbite-svelte-icons';

	let enabled = $derived(page.data.toc?.enabled ?? false);

	let nav : HTMLElement | undefined = $state();
	$effect(() => {
		if (nav) {
			if (!nav.classList.contains('tw-toc')) {
				nav.classList.add('tw-toc',
					'bg-gray-50', 'border-gray-100',
					'dark:bg-gray-800', 'dark:border-gray-700',
					'rounded-lg', 'border', '!pb-4',
					'border-gray-100', 'dark:border-gray-700',
					'divide-gray-100', 'dark:divide-gray-700');

				nav.querySelectorAll('li').forEach(li => {
					const fontSizeStr = li.style.fontSize;
					if (!fontSizeStr.endsWith('ex')) return;

					const fontSize = parseFloat(fontSizeStr);
					const indent = (3 - fontSize) / 0.1;

					const newFontSize = Math.max(2 - 0.2 * indent, 1);
					li.style.fontSize = `${newFontSize}ex`;
				});
			}
		}
	});
</script>

{#snippet title_snippet()}
	<Span class="font-medium">
		On this page:
	</Span>
{/snippet}

{#snippet toc_item(heading)}
	<span class="block rounded py-0.5 pe-4 ps-3 md:p-0 font-medium">
		{heading.textContent}
	</span>
{/snippet}

{#snippet open_toc_icon()}
	<div class="
		text-gray-500 dark:text-gray-400
		hover:bg-gray-100 dark:hover:bg-gray-700
		focus:outline-none focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-700
		rounded-lg text-sm p-2.5">
		<BarsFromLeftOutline class="size-5" />
	</div>
{/snippet}

<div class={enabled ? '' : 'hidden'}>
	<Toc
		bind:nav={nav}
		minItems={2}
		warnOnEmpty={false}
		--toc-mobile-btn-padding="0"
		--toc-active-bg="transparent"
		--toc-font="ui-sans-serif,system-ui,sans-serif,&quot;Apple Color Emoji&quot;,&quot;Segoe UI Emoji&quot;,Segoe UI Symbol,&quot;Noto Color Emoji&quot;"
		--toc-li-font="ui-sans-serif,system-ui,sans-serif,&quot;Apple Color Emoji&quot;,&quot;Segoe UI Emoji&quot;,Segoe UI Symbol,&quot;Noto Color Emoji&quot;"
		{title_snippet}
		{toc_item}
		{open_toc_icon}
	>
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
  :global(html.dark nav.tw-toc>ol>li.active) {
      @apply text-white
      bg-primary-600 hover:bg-primary-700
      focus-within:ring-4 focus-within:outline-none
      focus-within:ring-primary-800 rounded-lg;
  }
	:global(nav.tw-toc>ol>li.active) {
		@apply text-white
			bg-primary-700 hover:bg-primary-800 dark:bg-primary-600 dark:hover:bg-primary-700
    	focus-within:ring-4 focus-within:outline-none
    	focus-within:ring-primary-300 dark:focus-within:ring-primary-800 rounded-lg;
  }
</style>
