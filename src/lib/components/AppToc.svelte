<script lang="ts">
	import { page } from '$app/state';
	import { Span } from 'flowbite-svelte';
	import tocbot from 'tocbot';
	import { BarsFromLeftOutline } from 'flowbite-svelte-icons';
	import {onDestroy, onMount} from "svelte";

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
			// How many heading levels should not be collapsed.
			collapseDepth: 2,
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
	<aside class="toc desktop py-4 bg-gray-50 border-gray-100 dark:bg-gray-800 dark:border-gray-700 divide-gray-100 dark:divide-gray-700 border rounded-lg">
		<span class="ms-[1em] text-gray-900 dark:text-white font-medium">On this page:</span>
		<nav class="js-toc">
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
		/*background: var(--toc-desktop-bg);*/
		max-width: var(--toc-desktop-max-width);
		top: var(--toc-desktop-sticky-top, 2em);
	}

	aside.toc > nav {
		position: relative;
		max-height: var(--toc-max-height, 90vh);
		padding-inline-end: 1em;
	}

	:global(aside.toc > nav li) {
      cursor: pointer;
      border: var(--toc-li-border);
      border-radius: var(--toc-li-border-radius);
      margin: var(--toc-li-margin);

			margin-inline-start: 1em;
	}

  :global(aside.toc > nav a) {
			border-radius: .5rem;
      padding: var(--toc-li-padding, 2pt 4pt);
			display: block;

			font-weight: 500;
			/*padding-inline-start: .75rem;*/
			/*padding-inline-end: 1rem;*/
  }

  :global(aside.toc > nav a.node-name--H2) {
			font-size: 2ex;
  }

  :global(aside.toc > nav a.node-name--H3) {
			font-size: 1.8ex;
  }

  :global(aside.toc > nav a.node-name--H4) {
			font-size: 1.6ex;
  }

  :global(aside.toc > nav a.node-name--H5) {
			font-size: 1.6ex;
  }

  :global(aside.toc > nav a.node-name--H6) {
			font-size: 1.6ex;
  }

  :global(aside.toc > nav a) {
      @apply text-gray-900 hover:text-primary-700 focus-within:text-primary-700
      bg-transparent hover:bg-gray-100
      focus-within:ring-4 focus-within:outline-none
      focus-within:ring-gray-200 rounded-lg;
  }

  :global(html.dark aside.toc > nav a) {
      @apply text-gray-400 hover:bg-transparent focus-within:text-white hover:text-white focus-within:ring-gray-700;
  }

  :global(aside.toc > nav a.is-active-link) {
      @apply text-white hover:text-white
      bg-primary-700 hover:bg-primary-800 focus-within:ring-4 focus-within:outline-none focus-within:ring-primary-300 rounded-lg;
	}

  :global(html.dark aside.toc > nav a.is-active-link) {
      @apply text-white bg-primary-600 hover:bg-primary-700 focus-within:ring-primary-800;
	}
</style>
