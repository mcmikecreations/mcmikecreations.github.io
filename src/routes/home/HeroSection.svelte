<script>
	import { Heading, Img, P } from 'flowbite-svelte';
	import resume from '$lib/data/resume.json';
</script>

<section class="relative isolate flex flex-wrap justify-center min-h-[calc(100vh-3.75rem)]">
	<div class="absolute w-full h-full -z-10 overflow-hidden bg-white dark:bg-black" aria-hidden="true">
		<Img class="w-full h-full object-cover object-center blur-sm grayscale opacity-50" src={resume.basics.image} alt="Portrait of Mykola Morozov"/>
	</div>
	<div class="max-w-screen-xl px-4 py-8 mx-auto lg:gap-8 xl:gap-0 lg:py-16 flex place-items-center">
		<div class="text-center">
			<Heading tag="h1" class="text-4xl font-bold tracking-tight sm:text-6xl">{resume.basics.name}</Heading>
			<P class="mt-6 text-lg leading-8 text-center">{resume.basics.quote}</P>
		</div>
	</div>
</section>