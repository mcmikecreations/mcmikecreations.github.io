<script lang="ts">
	import maps from '$lib/data/hikes.json';
	import { onMount } from 'svelte';

	const GRID_ROWS = 6; // Configurable constant for vertical number of elements

	type HikeItem = { name: string; route: string; draft?: boolean };
	type WeekData = { year: number; label: string; weekIndex: number; hikes: HikeItem[] };

	const yearsData = new Map<number, WeekData[]>();
	let maxHikesPerWeek = 1;

	function getYearWeeks(year: number) {
		const weeks: WeekData[] = [];
		for (let i = 0; i < 53; i++) {
			const wStart = new Date(Date.UTC(year, 0, 1 + i * 7));
			const wEnd = new Date(Math.min(Date.UTC(year, 0, 1 + i * 7 + 6), Date.UTC(year, 11, 31)));
			if (wStart.getUTCFullYear() > year) break;

			const startStr = wStart.toISOString().split('T')[0];
			const endStr = wEnd.toISOString().split('T')[0];

			weeks.push({
				year: year,
				weekIndex: i,
				label: `${startStr} to ${endStr}`,
				hikes: []
			});
		}
		return weeks;
	}

	// Populate data map
	for (const hike of maps) {
		if (hike.properties?.draft === true || hike.properties?.hidden === true) {
			continue;
		}

		const dates = hike.properties.dates || [];

		for (const dateObj of dates) {
			const dateStr = dateObj.date; // e.g. YYYY-MM-DD
			const year = parseInt(dateStr.substring(0, 4));
			const month = parseInt(dateStr.substring(5, 7)) - 1;
			const day = parseInt(dateStr.substring(8, 10));

			if (!yearsData.has(year)) {
				yearsData.set(year, getYearWeeks(year));
			}

			const d = new Date(Date.UTC(year, month, day));
			const startOfYear = new Date(Date.UTC(year, 0, 1));
			const daysElapsed = Math.floor((d.getTime() - startOfYear.getTime()) / 86400000);
			const weekIndex = Math.floor(daysElapsed / 7);

			const filename = dateObj.path ? dateObj.path.split('/').pop()?.replace('.md', '') : null;
			const targetRoute = filename ? `/hikes/${filename}/` : hike.route;

			const weeks = yearsData.get(year)!;
			if (weeks[weekIndex]) {
				weeks[weekIndex].hikes.push({
					name: (hike.properties.draft ? '⏳ ' : '') + hike.name,
					route: targetRoute
				});

				if (weeks[weekIndex].hikes.length > maxHikesPerWeek) {
					maxHikesPerWeek = weeks[weekIndex].hikes.length;
				}
			}
		}
	}

	const sortedYears = [...yearsData.keys()].sort((a, b) => a - b);

	let allWeeks: WeekData[] = [];
	for (const year of sortedYears) {
		allWeeks = allWeeks.concat(yearsData.get(year)!);
	}

	function generateColumns(weeks: WeekData[] | undefined) {
		const columns: WeekData[][] = [];
		weeks = weeks ?? [];
		for (let i = 0; i < weeks.length; i += GRID_ROWS) {
			columns.push(weeks.slice(i, i + GRID_ROWS));
		}
		return columns;
	}

	const allColumns = generateColumns(allWeeks);

	function getIntensityClass(count: number) {
		if (count === 0) return 'bg-gray-200 dark:bg-gray-700';
		if (count === 1) return 'bg-emerald-300 dark:bg-emerald-800';
		if (count === 2) return 'bg-emerald-400 dark:bg-emerald-600';
		if (count === 3) return 'bg-emerald-600 dark:bg-emerald-500';
		return 'bg-emerald-700 dark:bg-emerald-400';
	}

	let scrollContainer: HTMLDivElement;

	onMount(() => {
		if (scrollContainer) {
			scrollContainer.scrollLeft = scrollContainer.scrollWidth;
		}
	});

	let activeWeek: WeekData | null = null;
	let popoverStyle = "";

	function togglePopover(event: MouseEvent | KeyboardEvent, week: WeekData) {
		event.stopPropagation();
		if (activeWeek === week) {
			activeWeek = null;
		} else {
			activeWeek = week;
			const target = event.currentTarget as HTMLElement;
			const rect = target.getBoundingClientRect();

			// Position centered above the box (using fixed window coordinates)
			const left = rect.left + rect.width / 2;
			const top = rect.top - 8;

			popoverStyle = `left: ${left}px; top: ${top}px; transform: translate(-50%, -100%); pointer-events: auto;`;
		}
	}

	function closePopover() {
		activeWeek = null;
	}
</script>

<svelte:window on:click={closePopover} on:scroll={closePopover} on:resize={closePopover} />

<div bind:this={scrollContainer} on:scroll={closePopover} class="w-full text-sm overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
	<div class="flex flex-row gap-1.5 min-w-max mt-5 mx-1">
		{#each allColumns as col, i}
			<div class="flex flex-col gap-1.5">
				<div class="h-6 relative">
					{#if i === 0 || col[0].year !== allColumns[i - 1][0].year}
						<span class="absolute left-0 bottom-1 font-semibold text-gray-700 dark:text-gray-300 m-0 z-10 whitespace-nowrap">{col[0].year}</span>
					{/if}
				</div>
				{#each col as week}
					<div
						id="week-{week.year}-{week.weekIndex}"
						class="w-4 h-4 rounded-sm {getIntensityClass(week.hikes.length)} transition-colors hover:ring-2 hover:ring-gray-400 dark:hover:ring-gray-500 cursor-pointer"
						role="button"
						tabindex="0"
						aria-label="{week.label}: {week.hikes.length} hikes"
						on:click={(e) => week.hikes.length > 0 && togglePopover(e, week)}
						on:keydown={(e) => e.key === 'Enter' && week.hikes.length > 0 && togglePopover(e, week)}
					></div>
				{/each}
			</div>
		{/each}
	</div>
</div>

{#if activeWeek}
	<!-- svelte-ignore a11y-click-events-have-key-events a11y-no-static-element-interactions -->
	<div
		class="fixed z-[9999] w-64 p-3 bg-white rounded-lg shadow-xl dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm font-light text-gray-500 dark:text-gray-400"
		style={popoverStyle}
		on:click={(e) => e.stopPropagation()}
	>
		<div class="font-medium mb-2 border-b pb-2 dark:border-gray-700 text-gray-900 dark:text-white">Week: {activeWeek.label}</div>
		<ul class="list-disc pl-4 m-0 space-y-1 text-left">
			{#each activeWeek.hikes as hike}
				<li class="break-words">
					<a href={hike.route} class="text-primary-600 dark:text-primary-500 hover:underline">{hike.name}</a>
				</li>
			{/each}
		</ul>
		<!-- Custom tooltip arrow -->
		<div class="absolute w-3 h-3 bg-white border-b border-r border-gray-200 dark:border-gray-700 dark:bg-gray-800 transform rotate-45 left-1/2 -bottom-1.5 -ml-1.5 shadow-sm rounded-sm"></div>
	</div>
{/if}
