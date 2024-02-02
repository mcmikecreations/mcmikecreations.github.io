<script lang="ts">
	import type { PageData } from './$types';
	import SvelteMarkdown from 'svelte-markdown';

	export let data: PageData;
</script>

<SvelteMarkdown source={data.content} />
