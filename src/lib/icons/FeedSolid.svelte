<script lang="ts">
	import { getContext } from 'svelte';
	import { twMerge } from 'tailwind-merge';
	import type { BaseProps, Props, Size } from 'flowbite-svelte-icons/types';

	const ctx: BaseProps = getContext('iconCtx') ?? {};
	const sizes = {
		xs: 'w-3 h-3',
		sm: 'w-4 h-4',
		md: 'w-5 h-5',
		lg: 'w-6 h-6',
		xl: 'w-8 h-8'
	};

	let {
		size,
		width,
		height,
		color = ctx.color || 'currentColor',
		title,
		desc,
		class: className,
		ariaLabel = 'feed solid',
		role = ctx.role || 'img',
		...restProps
	}: Props = $props();

	// Type-safe size determination
	const effectiveSize: Size = $derived(
		width === undefined && height === undefined
			? (size ?? (ctx.size as Size | undefined) ?? 'md')
			: 'md' // fallback, won't be used if width/height are set
	);

	// Only use size classes when width/height are not provided
	const sizeClass = $derived(
		width === undefined && height === undefined ? sizes[effectiveSize] : undefined
	);

	const ariaDescribedby = $derived(`${title?.id || ''} ${desc?.id || ''}`.trim());
	const hasDescription = $derived(!!(title?.id || desc?.id));
	const isLabeled = $derived(!!ariaLabel || hasDescription);
</script>

<svg
	xmlns="http://www.w3.org/2000/svg"
	viewBox="0 0 256 256"
	fill="currentColor"
	{color}
	{width}
	{height}
	{...restProps}
	class={twMerge('shrink-0', sizeClass, `${className}`)}
	role={isLabeled ? role : undefined}
	aria-label={ariaLabel}
	aria-describedby={hasDescription ? ariaDescribedby : undefined}
	aria-hidden={!isLabeled}
>
	{#if title?.id && title.title}
		<title id={title.id}>{title.title}</title>
	{/if}
	{#if desc?.id && desc.desc}
		<desc id={desc.id}>{desc.desc}</desc>
	{/if}
	<circle cx="68" cy="189" r="24" fill="currentColor"/>
	<path d="M160 213h-34a82 82 0 0 0 -82 -82v-34a116 116 0 0 1 116 116z" fill="currentColor"/>
	<path d="M184 213A140 140 0 0 0 44 73 V 38a175 175 0 0 1 175 175z" fill="currentColor"/>
</svg>