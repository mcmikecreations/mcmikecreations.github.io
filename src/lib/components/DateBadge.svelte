<!-- @migration-task Error while migrating Svelte code: $$props is used together with named props in a way that cannot be automatically migrated. -->
<script lang="ts">
	import { CalendarMonthSolid } from 'flowbite-svelte-icons';
	import { Span } from 'flowbite-svelte';
	import { twMerge } from 'tailwind-merge';

	let {
		date = new Date(),
		dateEnd = undefined,
		splitter = ' to ',
		iconClass = '',
		class: propsClass,
		...other
	} : {
		date : Date,
		dateEnd? : Date | string | undefined,
		splitter? : string,
		iconClass? : string,
		class? : string,
		propsClass? : string
	} = $props();

	function formatDate(d : Date | string) : string {
		if (typeof d === 'string') {
			return d;
		}

		return d.getFullYear().toString().padStart(4,'0') +
			'/' +
			(d.getMonth() + 1).toString().padStart(2,'0') +
			'/' +
			d.getDate().toString().padStart(2,'0');
	}
</script>

<span class="whitespace-nowrap">
	<CalendarMonthSolid ariaLabel="date" class={twMerge('inline w-4 h-4 text-gray-900 dark:text-white', iconClass)} />
	<Span dir="ltr" {...other} class={twMerge('font-semibold text-gray-900 dark:text-white align-middle', propsClass)}>{formatDate(date) + (dateEnd ? (splitter + formatDate(dateEnd)) : '')}</Span>
</span>