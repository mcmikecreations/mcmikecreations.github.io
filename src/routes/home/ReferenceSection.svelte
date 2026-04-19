<script lang="ts">
	import { Carousel, ControlButton, Controls, CarouselIndicators, Heading } from 'flowbite-svelte';
	import resume from '$lib/data/resume.json';
	import QuotesSolid from '$lib/icons/QuotesSolid.svelte';
	import { scale } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';

	const animation = (node: HTMLElement) => scale(node, { duration: 500, easing: quintOut });
	const references = resume.references;
	let index = $state(0);
</script>

<section id="references">
	<Heading tag="h2" class="text-center mt-8">References and Testimonials</Heading>
	<div class="max-w-screen-lg mt-8 mx-auto px-4 md:px-0">
		<figure class="block object-cover mb-[1.625rem]">
			<QuotesSolid class="size-12 mx-auto mb-3 text-gray-400 dark:text-gray-600" />
			<Carousel
				transition={animation}
				images={references}
				class="min-h-[40rem] sm:min-h-[24rem] md:min-h-[36rem] lg:min-h-[24rem] relative"
				bind:index
			>
				<Controls
					class="text-gray-700 dark:text-gray-300"
				>
					{#snippet children(changeSlide)}
						<ControlButton class="absolute start-4 top-1/2 -translate-y-[5%] p-2 text-gray-700 dark:text-gray-300" forward={false} name="Previous" onclick={() => changeSlide(false)} />
						<ControlButton class="absolute end-4 top-1/2 -translate-y-[5%] p-2 text-gray-700 dark:text-gray-300" forward={true} name="Next" onclick={() => changeSlide(true)} />
					{/snippet}
				</Controls>
				<CarouselIndicators
					activeClass="bg-gray-900 hover:bg-gray-700 dark:bg-gray-100 dark:hover:bg-gray-300 opacity-100"
					inactiveClass="bg-gray-900 hover:bg-gray-700 dark:bg-gray-100 dark:hover:bg-gray-300 opacity-60"
				/>
				{#snippet slide({ index })}
					<p
						transition:animation
						class="overflow-y-auto text-justify md:text-start text-base md:text-xl font-medium text-gray-900 dark:text-white"
					>"{references[index].reference}"</p>
				{/snippet}
			</Carousel>
			<figcaption class="flex items-center justify-center mt-6 space-x-3">
				<div class="flex items-center mb-6 divide-x-2 divide-gray-300 dark:divide-gray-700">
					<div class="pe-3 text-base font-medium text-gray-900 dark:text-white">{references[index].name}</div>
					<div class="px-3 text-sm font-light text-gray-600 dark:text-gray-400">{references[index].position}</div>
					<div class="ps-3 text-sm font-light text-gray-600 dark:text-gray-400">{references[index].institution}</div>
				</div>
			</figcaption>
		</figure>
	</div>
</section>