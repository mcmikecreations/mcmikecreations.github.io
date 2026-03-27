<script lang="ts">
	import AppTitle from '$lib/components/AppTitle.svelte';
	import ResumeHeader from './ResumeHeader.svelte';
	import ResumeExperience from './ResumeExperience.svelte';
	import ResumePublications from './ResumePublications.svelte';
	import ResumeAwards from './ResumeAwards.svelte';
	import { PrinterSolid } from 'flowbite-svelte-icons';
	import { Button } from 'flowbite-svelte';
</script>

<AppTitle title="Résumé" />

<section class="container mx-auto md:px-24">
	<ResumeHeader />
	<ResumeExperience />
	<ResumePublications />
	<ResumeAwards />
</section>

<Button href="/cv.pdf" pill={true} class="fixed bottom-6 right-6 px-5 py-2.5 text-sm p-3!">
	<PrinterSolid class="size-8" />
</Button>
