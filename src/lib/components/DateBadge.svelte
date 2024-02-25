<script lang="ts">
	import { CalendarMonthSolid } from 'flowbite-svelte-icons';
	import { Span } from 'flowbite-svelte';
	import { twMerge } from 'tailwind-merge';

	export let date = new Date();
	export let dateEnd : Date | string | undefined;
	export let splitter = ' to ';
	export let iconClass = '';

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
	<Span dir="ltr" {...$$restProps} class={twMerge('align-middle', $$props.class)}>{formatDate(date) + (dateEnd ? (splitter + formatDate(dateEnd)) : '')}</Span>
</span>