<script lang="ts">
	import type { PageData } from './$types';
	import { List, Li, A } from 'flowbite-svelte';

	export let data: PageData;
</script>

{#if data.posts}
<List tag="ul" list="none">
	{#each data.posts as post}
	<Li>
		<A href={post.url}>{post.title}</A>
	</Li>
	{/each}
</List>
{/if}
