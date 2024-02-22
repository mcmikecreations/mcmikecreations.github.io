<script>
	import { Carousel, Heading } from 'flowbite-svelte';
	import resume from '$lib/data/resume.json';
	import ReferenceTestimonialSection from './ReferenceTestimonialSection.svelte';

	const references = resume.references;
</script>

<section id="references">
	<Heading tag="h2" class="text-center mt-8">References and Testimonials</Heading>
	<div class="mt-8 mx-4 2xl:mx-0">
		<Carousel images={references} let:Controls let:Indicators class="h-auto sm:h-auto xl:h-auto 2xl:h-auto">
			<Controls
				class="text-gray-700 dark:text-gray-300"
			/>
			<Indicators
				activeClass="bg-gray-900 hover:bg-gray-700 dark:bg-gray-100 dark:hover:bg-gray-300 opacity-100"
				inactiveClass="bg-gray-900 hover:bg-gray-700 dark:bg-gray-100 dark:hover:bg-gray-300 opacity-60"
			/>
			<ReferenceTestimonialSection slot="slide" let:index reference={references[index]} />
		</Carousel>
	</div>
</section>