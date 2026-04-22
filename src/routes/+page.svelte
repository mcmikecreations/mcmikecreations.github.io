<script lang="ts">
	import BlogSection from './home/BlogSection.svelte';
	import ResumeSection from './home/ResumeSection.svelte';
	import AppMeta from '$lib/components/AppMeta.svelte';
	import resume from '$lib/data/resume.json';
	import HeroSection from './home/HeroSection.svelte';
	import ContactSection from './home/ContactSection.svelte';
	import ReferenceSection from './home/ReferenceSection.svelte';
	import ProjectsSection from './home/ProjectsSection.svelte';
	import AppBreadcrumbs from '$lib/components/AppBreadcrumbs.svelte';
	import AppJsonLd from '$lib/components/AppJsonLd.svelte';
</script>

<AppMeta title="Home" description={resume.basics.summary} type="website" />
<AppBreadcrumbs items={[{ name: 'Home', href: '/' }]} />
<AppJsonLd variant="website" />

<HeroSection />

<main class="container mx-auto md:px-24">
	<ProjectsSection />
	<ResumeSection />
	<ReferenceSection />
	<BlogSection />
	<ContactSection />
</main>

<div class="mt-8"></div>
