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

	export let ariaLabel = 'feed solid';
</script>

<svg
	xmlns="http://www.w3.org/2000/svg"
	viewBox="0 0 256 256"
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
	<rect width="256" height="256" rx="55" ry="55" x="0" y="0" fill="none" stroke="currentColor" />
	<circle cx="68" cy="189" r="24" fill="currentColor"/>
	<path d="M160 213h-34a82 82 0 0 0 -82 -82v-34a116 116 0 0 1 116 116z" fill="currentColor"/>
	<path d="M184 213A140 140 0 0 0 44 73 V 38a175 175 0 0 1 175 175z" fill="currentColor"/>
</svg>