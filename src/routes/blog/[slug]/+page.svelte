<script lang="ts">
	import type { PageData } from './$types';
	import SvelteMarkdown from 'svelte-markdown';
	import AppTitle from '$lib/components/AppTitle.svelte';
	import DefaultCode from '$lib/renderers/DefaultCode.svelte';
	import { DarkModeLinker } from '$lib/renderers';

	export let data: PageData;
</script>

<AppTitle title={data.post.title} />

<DarkModeLinker />

<article class="mx-4 2xl:mx-0">
	<div class="mx-auto prose dark:prose-invert prose-a:text-primary-600 dark:prose-a:text-primary-500 md:prose-lg lg:prose-xl min-h-80">
		<SvelteMarkdown source={data.post.content} renderers={{ code: DefaultCode, }} />
	</div>
</article>
