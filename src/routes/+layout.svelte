<script lang="ts">
	import '../app.pcss';
	import { page } from '$app/stores';
	import {
		Navbar,
		NavBrand,
		NavHamburger,
		NavUl,
		NavLi,
	} from 'flowbite-svelte';
	import DarkModeButton from '$lib/components/DarkModeButton.svelte';
	import DarkModeHandler from '$lib/components/DarkModeHandler.svelte';

	export let shouldShowNavbar : 'true' | 'false' | undefined = undefined;
	$: showNavbar = shouldShowNavbar !== undefined ? (shouldShowNavbar === 'true') : ($page.data.header?.showNavbar ?? true);

	$: activeUrl = $page.url.pathname;
</script>

<DarkModeHandler />

{#if showNavbar}
<Navbar class="dark:bg-gray-800">
	<NavBrand href="/">
		<span class="self-center whitespace-nowrap text-xl font-semibold dark:text-white">Mykola Morozov</span>
	</NavBrand>
	<div class="flex md:order-2">
		<DarkModeButton />
		<NavHamburger />
	</div>
	<NavUl {activeUrl}>
		<NavLi href="/">Home</NavLi>
		<NavLi href="/resume">Résumé</NavLi>
		<NavLi href="/projects">Projects</NavLi>
		<NavLi href="/blog">Blog</NavLi>
		<NavLi href="/#contact">Contact</NavLi>
	</NavUl>
</Navbar>
{/if}

<slot />
