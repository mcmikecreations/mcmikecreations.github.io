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

	interface Props {
		shouldShowNavbar?: 'true' | 'false' | undefined;
		children?: import('svelte').Snippet;
	}

	let { shouldShowNavbar = undefined, children }: Props = $props();
	let showNavbar = $derived(shouldShowNavbar !== undefined ? (shouldShowNavbar === 'true') : ($page.data.header?.showNavbar ?? true));

	let activeUrl = $derived($page.url.pathname);
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
	<NavUl {activeUrl} classes={{ ul: "md:space-x-8 md:mt-0 md:text-sm" }}>
		<NavLi class="md:p-0 rounded" href="/">Home</NavLi>
		<NavLi class="md:p-0 rounded" href="/resume">Résumé</NavLi>
		<NavLi class="md:p-0 rounded" href="/projects">Projects</NavLi>
		<NavLi class="md:p-0 rounded" href="/blog">Blog</NavLi>
		<NavLi class="md:p-0 rounded" href="/#contact">Contact</NavLi>
	</NavUl>
</Navbar>
{/if}

{@render children?.()}
