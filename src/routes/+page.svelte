<script lang="ts">
	import BlogSection from './home/BlogSection.svelte';
	import ResumeSection from './home/ResumeSection.svelte';
	import AppFooter from '$lib/components/AppFooter.svelte';
	import AppTitle from '$lib/components/AppTitle.svelte';
	import HeroSection from './home/HeroSection.svelte';
	import ContactSection from './home/ContactSection.svelte';
	import ReferenceSection from './home/ReferenceSection.svelte';
	import ProjectsSection from './home/ProjectsSection.svelte';
</script>

<AppTitle title="Home" />

<HeroSection />

<main class="container mx-auto md:px-24">
	<ProjectsSection />
	<ResumeSection />
	<ReferenceSection />
	<BlogSection />
	<ContactSection />
</main>

<div class="mt-8"></div>

<AppFooter />
