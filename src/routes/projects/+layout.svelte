<script>
	import AppFooter from '$lib/components/AppFooter.svelte';
	import AppToc from '$lib/components/AppToc.svelte';
</script>

<section class="container mx-auto my-8">
	<div class="mx-4 2xl:mx-0 md:px-24 mb-8 flex flex-row-reverse">
		<AppToc />
		<slot></slot>
	</div>
</section>

<AppFooter />
