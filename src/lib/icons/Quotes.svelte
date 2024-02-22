<script lang="ts">
	import { twMerge } from 'tailwind-merge';
	import { getContext } from 'svelte';

	interface CtxType {
		size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
		role?: string;
	}

	const ctx: CtxType = getContext('iconCtx') ?? {};
	const sizes = {
		xs: 'w-3 h-3',
		sm: 'w-4 h-4',
		md: 'w-5 h-5',
		lg: 'w-6 h-6',
		xl: 'w-8 h-8',
		tm: 'w-12 h-12'
	};

	export let size: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'tm' = ctx.size || 'md';
	export let role = ctx.role || 'img';

	export let ariaLabel = 'quotes';
</script>

<svg
	viewBox="0 0 24 27"
	fill="currentColor"
	xmlns="http://www.w3.org/2000/svg"
	{...$$restProps}
	class={twMerge('shrink-0', sizes[size], $$props.class)}
	{role}
	aria-label={ariaLabel}
	on:click
	on:keydown
	on:keyup
	on:focus
	on:blur
	on:mouseenter
	on:mouseleave
	on:mouseover
	on:mouseout
>
<!-- From flowbite-svelte-blocks -->
	<path
		d="M14.017 18L14.017 10.609C14.017 4.905 17.748 1.039 23 0L23.995 2.151C21.563 3.068 20 5.789 20 8H24V18H14.017ZM0 18V10.609C0 4.905 3.748 1.038 9 0L9.996 2.151C7.563 3.068 6 5.789 6 8H9.983L9.983 18L0 18Z"
		fill="currentColor"
	/>
</svg>