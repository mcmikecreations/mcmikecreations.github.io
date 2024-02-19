<script lang="ts">
	import '../app.pcss';
	import { page } from '$app/stores';
	import {
		Navbar,
		NavBrand,
		NavHamburger,
		NavUl,
		NavLi,
		DarkMode,
	} from 'flowbite-svelte';
	import AppFooter from '$lib/components/AppFooter.svelte';

	$: activeUrl = $page.url.pathname;
</script>
<Navbar class="dark:bg-gray-800">
	<NavBrand href="/">
		<span class="self-center whitespace-nowrap text-xl font-semibold dark:text-white">Mykola Morozov</span>
	</NavBrand>
	<div class="flex md:order-2">
		<DarkMode />
		<NavHamburger />
	</div>
	<NavUl {activeUrl}>
		<NavLi href="/">Home</NavLi>
		<NavLi href="/resume">Resume</NavLi>
		<NavLi href="/projects">Projects</NavLi>
		<NavLi href="/blog">Blog</NavLi>
<!--		<NavLi href="/contact">Contact</NavLi>-->
	</NavUl>
</Navbar>

<slot />
