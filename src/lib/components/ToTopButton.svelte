<script lang="ts">
	import { Button } from 'flowbite-svelte';
	import { ArrowUpOutline } from 'flowbite-svelte-icons';
	import { onMount } from 'svelte';

	export let minScroll = 100;

	function scrollToTop() {
		window.scroll({
			top: 0,
			behavior: 'smooth'
		})
	}

	onMount(() => {
		const scrollButton = document.getElementById('scrollButton');
		const hiddenClass = 'hidden';

		if (scrollButton) {
			const listener = () => {
				if (window.scrollY > minScroll) {
					if (scrollButton.classList.contains(hiddenClass)) {
						scrollButton.classList.remove(hiddenClass);
					}
				} else if (!scrollButton.classList.contains(hiddenClass)) {
					scrollButton.classList.add(hiddenClass);
				}
			};

			window.addEventListener("scroll", listener);
		}
	});
</script>

<Button id="scrollButton" on:click={scrollToTop} pill={true} class="fixed bottom-6 right-6 !p-2 hidden">
	<ArrowUpOutline class="w-4 h-4" />
</Button>
