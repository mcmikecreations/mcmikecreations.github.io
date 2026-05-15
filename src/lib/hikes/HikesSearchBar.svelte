<script lang="ts">
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { browser } from '$app/environment';
	import { SearchOutline } from 'flowbite-svelte-icons';

	interface Props {
		class?: string;
	}

	let { class: extraClass = '' }: Props = $props();

	let value = $state('');
	let dropdownOpen = $state(false);
	let inputRef = $state<HTMLInputElement | null>(null);

	$effect(() => {
		if (!browser) return;
		value = page.url.searchParams.get('q') ?? '';
	});

	function handleSubmit(e: SubmitEvent) {
		e.preventDefault();
		const q = value.trim();
		dropdownOpen = false;
		goto('/hikes/search/' + (q ? '?q=' + encodeURIComponent(q) : ''));
	}

	function openDropdown() {
		dropdownOpen = true;
		setTimeout(() => inputRef?.focus(), 10);
	}

	function closeDropdown() {
		dropdownOpen = false;
	}
</script>

<!-- Mobile: icon button + full-width dropdown below the navbar -->
<div class="lg:hidden {extraClass}">
	<button
		type="button"
		aria-label="Search hikes"
		aria-expanded={dropdownOpen}
		onclick={openDropdown}
		class="bg-white/50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-hidden focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-700 rounded-lg text-sm p-2"
	>
		<SearchOutline class="size-5" />
	</button>

	{#if dropdownOpen}
		<!-- Backdrop: catches outside clicks -->
		<div
			role="presentation"
			class="fixed inset-0 z-40"
			onclick={closeDropdown}
		></div>
		<!-- Dropdown panel fixed below the navbar -->
		<div class="fixed top-[60px] left-0 right-0 z-50 border-t border-gray-200 bg-white px-4 py-3 shadow-lg dark:border-gray-700 dark:bg-gray-800">
			<form onsubmit={handleSubmit} class="flex items-center" role="search" aria-label="Search hikes">
				<input
					bind:this={inputRef}
					type="search"
					name="q"
					bind:value
					placeholder="Search hikes…"
					aria-label="Search query"
					onkeydown={(e) => { if (e.key === 'Escape') closeDropdown(); }}
					class="h-9 flex-1 rounded-l-md border border-r-0 px-3 text-sm border-gray-300 bg-white/75 dark:bg-gray-800/75 text-gray-900 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 focus:outline-hidden focus:ring-1 focus:ring-gray-200 dark:focus:ring-gray-700"
				/>
				<button
					type="submit"
					aria-label="Submit search"
					class="flex h-9 items-center rounded-r-md border px-2 border-gray-300 bg-white/50 dark:bg-gray-800/50 text-gray-600 dark:border-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-hidden focus:ring-1 focus:ring-gray-200 dark:focus:ring-gray-700"
				>
					<SearchOutline class="size-4" />
				</button>
			</form>
		</div>
	{/if}
</div>

<!-- Desktop: inline search form -->
<form
	onsubmit={handleSubmit}
	class="hidden lg:flex shrink-0 items-center {extraClass}"
	role="search"
	aria-label="Search hikes"
>
	<input
		type="search"
		name="q"
		bind:value
		placeholder="Search hikes…"
		aria-label="Search query"
		class="w-44 h-9 rounded-l-md border border-r-0 px-2 text-sm border-gray-300 bg-white/75 dark:bg-gray-800/75 text-gray-900 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 focus:outline-hidden focus:ring-1 focus:ring-gray-200 dark:focus:ring-gray-700"
	/>
	<button
		type="submit"
		aria-label="Submit search"
		class="flex h-9 items-center rounded-r-md border px-2 border-gray-300 bg-white/50 dark:bg-gray-800/50 text-gray-600 dark:border-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-hidden focus:ring-1 focus:ring-gray-200 dark:focus:ring-gray-700"
	>
		<SearchOutline class="size-4" />
	</button>
</form>
