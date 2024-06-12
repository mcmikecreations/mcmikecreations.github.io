<script lang="ts">
	import { page } from '$app/stores';
	import Toc from 'svelte-toc';
	import { Span } from 'flowbite-svelte';

	$: enabled = $page.data.toc?.enabled ?? false;

	let nav : HTMLElement | undefined;
	$: if (nav) {
		if (!nav.classList.contains('tw')) {
			nav.classList.add('tw', 'dark:bg-gray-900');
		}
	}
</script>

<div class={enabled ? '' : 'hidden'}>
	<Toc
		bind:nav={nav}
	>
		<Span let:heading slot="toc-item">
    	{heading.textContent}
		</Span>
		<Span slot="title" class="font-normal">On this page:</Span>
	</Toc>
</div>
