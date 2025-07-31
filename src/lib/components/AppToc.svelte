<script lang="ts">
	import { page } from '$app/state';
	import { Span } from 'flowbite-svelte';
	import tocbot from 'tocbot';
	import { BarsFromLeftOutline } from 'flowbite-svelte-icons';
	import {onDestroy, onMount} from "svelte";

	import 'tocbot/dist/tocbot.css';

	let enabled = $derived(page.data.toc?.enabled ?? false);

	onMount(() => {
		tocbot.init({
			// Where to render the table of contents.
			tocSelector: '.js-toc',
			// Where to grab the headings to build the table of contents.
			contentSelector: 'main',
			// Which headings to grab inside of the contentSelector element.
			headingSelector: 'h2, h3, h4',
			// For headings inside relative or absolute positioned containers within content.
			hasInnerContainers: true,
		});
	});

	onDestroy(() => {
		tocbot.destroy();
	})

	let nav : HTMLElement | undefined = $state(undefined);

	/*function updateNav(nav : HTMLElement | undefined) {
		alert(nav);
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
	}

	$effect(() => {
		updateNav($nav);
	});*/
</script>

{#snippet title_snippet()}
	<Span class="font-medium">
		On this page:
	</Span>
{/snippet}

{#snippet toc_item(heading : HTMLHeadingElement)}
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
	<aside class="toc desktop">
		<nav class="js-toc !pb-4 bg-gray-50 border-gray-100 border rounded-lg">
			<span class="text-gray-900 dark:text-white font-medium">On this page:</span>
		</nav>
	</aside>
</div>

<style>
	aside.toc {
		box-sizing: border-box;
		height: max-content;
		overflow-wrap: break-word;
		font-size: var(--toc-font-size);
		min-width: var(--toc-min-width);
		width: var(--toc-width);
		z-index: var(--toc-z-index, 1);

		--toc-mobile-btn-padding: 0;
		--toc-active-bg: transparent;
	}

	aside.toc.desktop {
		margin: var(--toc-desktop-aside-margin, var(--toc-desktop-nav-margin));
		position: sticky;
		background: var(--toc-desktop-bg);
		max-width: var(--toc-desktop-max-width);
		top: var(--toc-desktop-sticky-top, 2em);
	}

	aside.toc > nav {
		position: relative;
		max-height: var(--toc-max-height, 90vh);
		padding: var(--toc-padding, 1em 1em 0);
	}

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
