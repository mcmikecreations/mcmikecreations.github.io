<script lang="ts">
	import AppFooter from '$lib/components/AppFooter.svelte';
	import AppTitle from '$lib/components/AppTitle.svelte';
	import ResumeHeader from './ResumeHeader.svelte';
	import ResumeExperience from './ResumeExperience.svelte';
	import ResumePublications from './ResumePublications.svelte';
	import ResumeAwards from './ResumeAwards.svelte';
</script>

<AppTitle title="Résumé" />

<section class="container mx-auto md:px-24">
	<ResumeHeader />
	<ResumeExperience />
	<ResumePublications />
	<ResumeAwards />
</section>

<AppFooter />
