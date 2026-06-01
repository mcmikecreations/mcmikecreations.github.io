<script lang="ts">
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { browser } from '$app/environment';
	import { SearchOutline } from 'flowbite-svelte-icons';
	import { normalize } from '$lib/hikes/search-normalize';
	import type { SearchEntry } from '../../routes/hikes/search-index.json/+server';

	interface Props {
		class?: string;
	}

	let { class: extraClass = '' }: Props = $props();

	let value = $state('');
	let dropdownOpen = $state(false);
	let inputRef = $state<HTMLInputElement | null>(null);
	let suggestions = $state<{ title: string; url: string }[]>([]);
	let suggestionsOpen = $state(false);
	let debounceTimer: ReturnType<typeof setTimeout> | null = null;

	let searchIndex: SearchEntry[] | null = null;
	let indexLoading = false;

	$effect(() => {
		if (!browser) return;
		value = page.url.searchParams.get('q') ?? '';
	});

	function handleSubmit(e: SubmitEvent) {
		e.preventDefault();
		const q = value.trim();
		dropdownOpen = false;
		suggestionsOpen = false;
		goto('/hikes/search/' + (q ? '?q=' + encodeURIComponent(q) : ''));
	}

	function openDropdown() {
		dropdownOpen = true;
		setTimeout(() => inputRef?.focus(), 10);
	}

	function closeDropdown() {
		dropdownOpen = false;
		suggestionsOpen = false;
	}

	function scoreEntry(entry: SearchEntry, nq: string): number {
		const full = (s: string) => normalize(s) === nq;
		const partial = (s: string) => !full(s) && normalize(s).includes(nq);
		return (
			(full(entry.hikeName) || full(entry.title) ? 10000 : 0) +
			(entry.nodeNames.some((n) => full(n)) ? 5000 : 0) +
			(entry.tags.some((t) => full(t)) ? 5000 : 0) +
			(full(entry.description) ? 3000 : 0) +
			(partial(entry.hikeName) || partial(entry.title) ? 100 : 0) +
			(entry.nodeNames.some((n) => partial(n)) ? 40 : 0) +
			(entry.tags.some((t) => partial(t)) ? 40 : 0) +
			(partial(entry.description) ? 1 : 0)
		);
	}

	async function fetchFromIndex(q: string) {
		if (!searchIndex && !indexLoading) {
			indexLoading = true;
			try {
				const res = await fetch('/hikes/search-index.json');
				searchIndex = await res.json();
			} finally {
				indexLoading = false;
			}
		}
		if (!searchIndex) return;
		const nq = normalize(q);
		const results = searchIndex
			.map((e) => ({ entry: e, s: scoreEntry(e, nq) }))
			.filter((x) => x.s > 0)
			.sort((a, b) => b.s - a.s || b.entry.date.localeCompare(a.entry.date))
			.slice(0, 8);
		suggestions = results.map((x) => ({ title: x.entry.title, url: x.entry.url }));
		suggestionsOpen = suggestions.length > 0;
	}

	async function fetchSuggestions(q: string) {
		try {
			const res = await fetch('/hikes/suggestions.php?q=' + encodeURIComponent(q));
			if (!res.ok) throw new Error('not ok');
			const data: [string, string[], string[], string[]] = await res.json();
			const titles = data[1] ?? [];
			const urls = data[3] ?? [];
			if (titles.length === 0) { suggestionsOpen = false; return; }
			suggestions = titles.map((t, i) => ({
				title: t,
				url: urls[i]?.startsWith('http') ? new URL(urls[i]).pathname : (urls[i] ?? '')
			}));
			suggestionsOpen = true;
		} catch {
			await fetchFromIndex(q);
		}
	}

	function handleInput() {
		if (debounceTimer) clearTimeout(debounceTimer);
		const q = value.trim();
		if (q.length < 2) {
			suggestions = [];
			suggestionsOpen = false;
			return;
		}
		debounceTimer = setTimeout(() => fetchSuggestions(q), 300);
	}

	function selectSuggestion(url: string) {
		suggestionsOpen = false;
		dropdownOpen = false;
		goto(url);
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') {
			if (suggestionsOpen) {
				suggestionsOpen = false;
			} else {
				closeDropdown();
			}
		}
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
					oninput={handleInput}
					onkeydown={handleKeydown}
					autocomplete="off"
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
			{#if suggestionsOpen}
				<ul class="mt-2 overflow-hidden rounded-md border border-gray-200 dark:border-gray-700">
					{#each suggestions as s}
						<li>
							<button
								type="button"
								onmousedown={(e) => { e.preventDefault(); selectSuggestion(s.url); }}
								class="w-full border-b border-gray-100 px-3 py-2 text-left text-sm text-gray-900 last:border-0 hover:bg-gray-100 dark:border-gray-700 dark:text-white dark:hover:bg-gray-700"
							>
								{s.title}
							</button>
						</li>
					{/each}
				</ul>
			{/if}
		</div>
	{/if}
</div>

<!-- Desktop: inline search form -->
<form
	onsubmit={handleSubmit}
	class="hidden lg:flex shrink-0 relative items-center {extraClass}"
	role="search"
	aria-label="Search hikes"
>
	<input
		type="search"
		name="q"
		bind:value
		placeholder="Search hikes…"
		aria-label="Search query"
		oninput={handleInput}
		onkeydown={handleKeydown}
		onblur={() => setTimeout(() => { suggestionsOpen = false; }, 150)}
		autocomplete="off"
		class="w-44 h-9 rounded-l-md border border-r-0 px-2 text-sm border-gray-300 bg-white/75 dark:bg-gray-800/75 text-gray-900 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 focus:outline-hidden focus:ring-1 focus:ring-gray-200 dark:focus:ring-gray-700"
	/>
	<button
		type="submit"
		aria-label="Submit search"
		class="flex h-9 items-center rounded-r-md border px-2 border-gray-300 bg-white/50 dark:bg-gray-800/50 text-gray-600 dark:border-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-hidden focus:ring-1 focus:ring-gray-200 dark:focus:ring-gray-700"
	>
		<SearchOutline class="size-4" />
	</button>
	{#if suggestionsOpen}
		<ul class="absolute top-full left-0 z-50 mt-1 w-full min-w-[220px] overflow-hidden rounded-md border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800">
			{#each suggestions as s}
				<li>
					<button
						type="button"
						onmousedown={(e) => { e.preventDefault(); selectSuggestion(s.url); }}
						class="w-full border-b border-gray-100 px-3 py-2 text-left text-sm text-gray-900 last:border-0 hover:bg-gray-100 dark:border-gray-700 dark:text-white dark:hover:bg-gray-700"
					>
						{s.title}
					</button>
				</li>
			{/each}
		</ul>
	{/if}
</form>
