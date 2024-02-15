<script>
	import { page } from '$app/stores';
</script>

<section class="relative flex flex-wrap justify-center">
	<div class="py-8 px-4 mx-auto max-w-screen-xl lg:py-16 lg:px-6">
		<div class="mx-auto max-w-screen-sm text-center">
			<h1 class="mb-4 text-7xl tracking-tight font-extrabold lg:text-9xl text-primary-600 dark:text-primary-500">{$page.status}</h1>
			<p class="mb-4 text-3xl tracking-tight font-bold text-gray-900 md:text-4xl dark:text-white">{$page.error.message}.</p>
			<p class="mb-4 text-lg font-light text-gray-500 dark:text-gray-400">I <i data-svelte-h="svelte-1ao0nz">may</i> already be working to solve the problem.</p>
		</div>
	</div>
</section>
