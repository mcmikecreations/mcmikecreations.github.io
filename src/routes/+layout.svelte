<script lang="ts">
	import '../app.pcss';
	import { page } from '$app/state';
	import type { Snippet } from "svelte";
	import DarkModeHandler from '$lib/components/DarkModeHandler.svelte';
    import AppNavbar from "$lib/components/AppNavbar.svelte";
	import AppFooter from '$lib/components/AppFooter.svelte';

	interface Props {
		shouldShowNavbar?: 'true' | 'false' | undefined;
		shouldFixNavbar?: 'true' | 'false' | undefined;
		children?: Snippet;
	}

	let { shouldShowNavbar = undefined, shouldFixNavbar = undefined, children }: Props = $props();
	let showNavbar = $derived(shouldShowNavbar !== undefined ? (shouldShowNavbar === 'true') : (page.data.header?.showNavbar ?? true));
	let fixedNavbar = $derived(shouldFixNavbar !== undefined ? (shouldFixNavbar === 'true') : (page.data.header?.fixedNavbar ?? false));

	let activeUrl = $derived(page.url.pathname);
</script>

<DarkModeHandler />

<div class="flex flex-col min-h-[100dvh]">
	{#if showNavbar}
		<AppNavbar {fixedNavbar} />
	{/if}

	<div class="flex-grow flex flex-col w-full">
		{@render children?.()}
	</div>

	<AppFooter />
</div>
