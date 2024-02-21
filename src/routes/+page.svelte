<script lang="ts">
	import BlogSection from './home/BlogSection.svelte';
	import ResumeSection from './home/ResumeSection.svelte';
	import AppFooter from '$lib/components/AppFooter.svelte';
	import AppTitle from '$lib/components/AppTitle.svelte';
	import HeroSection from './home/HeroSection.svelte';
	import ContactSection from './home/ContactSection.svelte';
</script>

<AppTitle title="Home" />

<HeroSection />

<div class="container mx-auto md:px-16">
	<ResumeSection />
	<BlogSection />
	<ContactSection />
</div>

<div class="mt-8"></div>

<AppFooter />
