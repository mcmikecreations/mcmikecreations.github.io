<script lang="ts">
	import { Button } from 'flowbite-svelte';
	import { ArrowUpOutline } from 'flowbite-svelte-icons';
	import { onMount } from 'svelte';

	interface Props {
		minScroll?: number;
		position?: 'left' | 'right' | undefined;
	}

	let { minScroll = 100, position = 'right' }: Props = $props();

	let isVisible = $state(false);

	function scrollToTop() {
		window.scroll({
			top: 0,
			behavior: 'smooth'
		})
	}

	function handleScroll() {
		isVisible = window.scrollY > minScroll;
	}

	onMount(() => {
		// Check initial scroll position on load
		handleScroll();
	});
</script>

<svelte:window onscroll={handleScroll} />

<Button
	id="scrollButton"
	onclick={scrollToTop}
	pill={true}
	class="fixed bottom-6 {position === 'left' ? 'start-6' : 'end-6'} px-5 py-2.5 text-sm p-3! transition-opacity duration-300 {isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}"
>
	<ArrowUpOutline class="size-8" />
</Button>
