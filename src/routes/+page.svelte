<script lang="ts">
	import BlogSection from './home/BlogSection.svelte';
	import ResumeSection from './home/ResumeSection.svelte';
	import AppFooter from '$lib/components/AppFooter.svelte';
	import AppTitle from '$lib/components/AppTitle.svelte';
	import HeroSection from './home/HeroSection.svelte';
</script>

<AppTitle title="Home" />

<HeroSection />

<ResumeSection />

<BlogSection />

<div class="mt-8"></div>

<AppFooter />
