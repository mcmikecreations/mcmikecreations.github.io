<script lang="ts">
	import { getContext } from 'svelte';
	import { twMerge } from 'tailwind-merge';
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
		xl: 'w-8 h-8'
	};

	export let size: 'xs' | 'sm' | 'md' | 'lg' | 'xl' = ctx.size || 'md';
	export let role = ctx.role || 'img';

	export let ariaLabel = 'strava solid';
</script>

<svg
	xmlns="http://www.w3.org/2000/svg"
	viewBox="0 0 16 16"
	fill="currentColor"
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
	<g xmlns="http://www.w3.org/2000/svg" fill="currentColor" fill-rule="evenodd">
		<path d="M6.9 8.8l2.5 4.5 2.4-4.5h-1.5l-.9 1.7-1-1.7z" opacity=".6"/>
		<path d="M7.2 2.5l3.1 6.3H4zm0 3.8l1.2 2.5H5.9z"/>
	</g>
	<rect fill="currentColor" x="0" y="0" width="16" height="16" rx="3.6" opacity=".6"></rect>
</svg>
