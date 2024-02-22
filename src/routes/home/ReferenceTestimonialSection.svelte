<script lang="ts">
	import Quotes from '$lib/icons/Quotes.svelte';
	import Testimonial from '$lib/components/Testimonial.svelte';

	export let reference : {
		"name": string,
		"position": string,
		"institution": string,
		"email": string,
		"date": string,
		"reference": string
	};
</script>

<Testimonial icon={Quotes} classFigure="max-w-screen-lg px-16 mb-[1.625rem]">
	<blockquote>
		<p class="max-h-80 sm:max-h-96 md:max-h-none overflow-y-auto text-base md:text-xl font-medium text-gray-900 dark:text-white">"{reference.reference}"</p>
	</blockquote>
	<svelte:fragment slot="footer">
		<div class="flex items-center mb-6 divide-x-2 divide-gray-300 dark:divide-gray-700">
			<div class="pe-3 text-base font-medium text-gray-900 dark:text-white">{reference.name}</div>
			<div class="px-3 text-sm font-light text-gray-600 dark:text-gray-400">{reference.position}</div>
			<div class="ps-3 text-sm font-light text-gray-600 dark:text-gray-400">{reference.institution}</div>
		</div>
	</svelte:fragment>
</Testimonial>