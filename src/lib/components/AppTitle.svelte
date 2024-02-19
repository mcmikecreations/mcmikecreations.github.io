<script lang="ts">
	import resume from '$lib/data/resume.json';

	const titleBase = resume.basics.name;
	export let title : string | undefined;
</script>

<svelte:head>
	<title>{titleBase + (title ? (' | ' + title) : '')}</title>
</svelte:head>
