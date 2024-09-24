<script lang="ts">
	import type { PageData } from './$types';
	import SvelteMarkdown from 'svelte-markdown';
	import AppTitle from '$lib/components/AppTitle.svelte';
	import DefaultCode from '$lib/renderers/DefaultCode.svelte';
	import DefaultLink from '$lib/renderers/DefaultLink.svelte';
	import ToTopButton from '$lib/components/ToTopButton.svelte';

	export let data: PageData;
</script>

<AppTitle title={data.post.title} />

<article class="mx-4 2xl:mx-0">
	<div class="mx-auto prose dark:prose-invert prose-a:text-primary-600 dark:prose-a:text-primary-500 md:prose-lg lg:prose-xl min-h-80">
		<div class="flex flex-row flex-wrap gap-2">
			<span>{data.post.author}</span>
			·
			<span>{data.post.time}</span>
			·
			<span>{data.post.date}</span>
			{#if data.post.tags?.length}
				·
				<div class="flex flex-row justify-end gap-2" aria-details="tags">
					<span aria-label="tags" class="sr-only"/>
					{#each data.post.tags as t}
						<span>{t}</span>
					{/each}
				</div>
			{/if}
		</div>
		<SvelteMarkdown source={data.post.content} renderers={{ code: DefaultCode, link: DefaultLink }} />
	</div>
</article>

<ToTopButton />
