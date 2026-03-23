<script>
	import { A } from 'flowbite-svelte';
	import FeedSolid from '$lib/icons/FeedSolid.svelte';
	import { FileCodeSolid } from 'flowbite-svelte-icons';
</script>

<svelte:head>
	<link rel="alternate" type="application/rss+xml" title="Mykola's Hiking Blog RSS Feed" href="/hikes/feed.xml" />
	<link rel="alternate" type="application/atom+xml" title="Mykola's Hiking Blog Atom Feed" href="/hikes/atom.xml" />
</svelte:head>

<section class="container mx-auto mb-8">
	<div class="mx-4 2xl:mx-0 md:px-24 flex flex-row justify-between">
		<div>
			<A href="/hikes/feed.xml" data-sveltekit-reload><FeedSolid ariaLabel="RSS Feed" class="me-1" /> RSS Feed</A>
		</div>
		<div>
			<A href="/hikes/atom.xml" data-sveltekit-reload><FeedSolid ariaLabel="Atom Feed" class="me-1" /> Atom Feed</A>
		</div>
		<div>
			<A href="https://raw.githubusercontent.com/mykolamor/mcmikecreations.github.io/refs/heads/feature/svelte-update/src/lib/data/hikes.json"><FileCodeSolid ariaLabel="Json Feed" class="me-1" /> Json Feed</A>
		</div>
	</div>
</section>