<script lang="ts">
	import Quotes from '$lib/icons/Quotes.svelte';
	import { fly } from 'svelte/transition';
	import { getContext } from 'svelte';
	const state = getContext('state');

	export let reference : {
		"name": string,
		"position": string,
		"institution": string,
		"email": string,
		"date": string,
		"reference": string
	};
	$: transitionSlideIn = {
		x: $state.forward ? '100%' : '-100%',
		opacity: 1,
		width: '100%',
		height: '100%',
		duration: $state.slideDuration
	};
	$: transitionSlideOut = {
		x: $state.forward ? '-100%' : '100%',
		opacity: 0.9,
		width: '100%',
		height: '100%',
		duration: $state.slideDuration
	};
</script>

{#key reference}
	<figure class="absolute block !w-full !h-full object-cover px-12 mb-[1.625rem]" out:fly={transitionSlideOut} in:fly={transitionSlideIn}>
		<Quotes class="size-12 mx-auto mb-3 text-gray-400 dark:text-gray-600" />
		<blockquote>
			<p class="max-h-96 overflow-y-auto text-base md:text-xl font-medium text-gray-900 dark:text-white">"{reference.reference}"</p>
		</blockquote>
		<figcaption class="flex items-center justify-center mt-6 space-x-3">
			<div class="flex items-center mb-6 divide-x-2 divide-gray-300 dark:divide-gray-700">
				<div class="pe-3 text-base font-medium text-gray-900 dark:text-white">{reference.name}</div>
				<div class="px-3 text-sm font-light text-gray-600 dark:text-gray-400">{reference.position}</div>
				<div class="ps-3 text-sm font-light text-gray-600 dark:text-gray-400">{reference.institution}</div>
			</div>
		</figcaption>
	</figure>
{/key}