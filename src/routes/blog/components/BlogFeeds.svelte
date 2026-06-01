<script>
	import { A } from 'flowbite-svelte';
	import FeedSolid from '$lib/icons/FeedSolid.svelte';
	import { FileCodeSolid } from 'flowbite-svelte-icons';
</script>

<svelte:head>
	<link rel="alternate" type="application/rss+xml" title="Mykola's Programming Blog RSS Feed" href="/blog/feed.xml" />
	<link rel="alternate" type="application/atom+xml" title="Mykola's Programming Blog Atom Feed" href="/blog/atom.xml" />
</svelte:head>

<section class="container mx-auto my-8">
	<div class="mx-4 2xl:mx-0 md:px-24 flex flex-row justify-between">
		<div>
			<A href="/blog/feed.xml" target="_blank" rel="noopener noreferrer" data-sveltekit-reload><FeedSolid ariaLabel="RSS Feed" class="me-1" /> RSS Feed</A>
		</div>
		<div>
			<A href="/blog/atom.xml" target="_blank" rel="noopener noreferrer" data-sveltekit-reload><FeedSolid ariaLabel="Atom Feed" class="me-1" /> Atom Feed</A>
		</div>
		<div>
			<A href="/blog/index.json" target="_blank" rel="noopener noreferrer" data-sveltekit-reload><FileCodeSolid ariaLabel="Json Feed" class="me-1" /> Json Feed</A>
		</div>
	</div>
</section>
