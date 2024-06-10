<script lang="ts">
	import { A } from 'flowbite-svelte';

	interface Publication {
		url?: string;
		mirror?: string;
		name: string;
		publisher: string;
		releaseDate: string;
		summary: string;
	}

	export let pub : Publication | undefined = undefined;
	export let useComponent : boolean = true;
</script>

{#if pub}
	<span>{pub.name}</span>
	<span>{pub.publisher},</span>
	<span>{new Date(pub.releaseDate).toLocaleDateString('en-us', { year:"numeric", month:"short" })},</span>
	<span>
		{#if useComponent}
			{#if pub.url}<A href={pub.url} target="_blank">{pub.summary}</A>{:else}{pub.summary}{/if}{#if pub.mirror}, <A href={pub.mirror} target="_blank">[mirror]</A>.{/if}
		{:else}
			{#if pub.url}<a href={pub.url} target="_blank">{pub.summary}</a>{:else}{pub.summary}{/if}{#if pub.mirror}, <a href={pub.mirror} target="_blank">[mirror]</a>.{/if}
		{/if}
	</span>
{/if}