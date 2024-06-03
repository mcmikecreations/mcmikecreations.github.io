<script lang="ts">
	import maps from '$lib/data/hikes.json';
	import { Popover } from 'flowbite-svelte';

	const years = new Map<string, Map<string, { name: string, day: number, route: string }[]>>;

	for (const hike of maps) {
		if (hike.properties?.draft === true || hike.properties?.hidden === true) {
			continue;
		}

		const dates = hike.properties.dates;

		for (const date of dates) {
			const year = date.substring(0, 4);
			const month = date.substring(5, 7);
			const day = parseInt(date.substring(8, 10));

			if (!years.has(year)) {
				years.set(year, new Map([
					["01", []],
					["02", []],
					["03", []],
					["04", []],
					["05", []],
					["06", []],
					["07", []],
					["08", []],
					["09", []],
					["10", []],
					["11", []],
					["12", []],
				]));
			}

			years.get(year)!.get(month)!.push({ name: (hike.properties.draft ? '⏳ ' : '') + hike.name, day: day, route: hike.route });
		}
	}

	let maxHikesPerMonth = 1;

	for (const year of years.values()) {
		for (const month of year.values()) {
			month.sort((a, b) => a.day - b.day);

			if (month.length > maxHikesPerMonth) {
				maxHikesPerMonth = month.length;
			}
		}
	}

	function getColor(month : [string, unknown[]]) : string {
		const rel = month[1].length / maxHikesPerMonth;
		return `hsl(173deg ${89 * (rel * 0.75 + 0.25)}% ${72 * (rel * 0.6 + 0.4)}%)`;
	}
</script>

<div class="w-full">
	{#each years.entries() as year}
		<div class="flex flex-row flex-nowrap mt-2">
			<div>{year[0]}</div>
			{#each year[1].entries() as month}
				<div id="m{year[0]}{month[0]}" class="flex-1 !aspect-square ms-2" style="background: {getColor(month)}" />
				{#if month[1].length}
					<Popover class="text-sm font-light z-[1000]" defaultClass="" triggeredBy="#m{year[0]}{month[0]}">
						<ul class="list-none !my-2 !mx-2 !pl-0">
							{#each month[1] as hike}
								<li>{year[0]}-{month[0]}-{hike.day.toString().padStart(2, '0')}: <a href={hike.route}>{hike.name}</a></li>
							{/each}
						</ul>
					</Popover>
				{/if}
			{/each}
		</div>
	{/each}
</div>