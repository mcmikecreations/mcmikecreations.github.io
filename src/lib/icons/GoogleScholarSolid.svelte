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
		ariaLabel = 'google scholar solid',
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
	fill="currentColor"
	viewBox="0 0 512 512"
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
	<!--!Font Awesome Free 6.5.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.-->
	<path
		fill="currentColor"
		d="M390.9 298.5c0 0 0 .1 .1 .1c9.2 19.4 14.4 41.1 14.4 64C405.3 445.1 338.5 512 256 512s-149.3-66.9-149.3-149.3c0-22.9 5.2-44.6 14.4-64h0c1.7-3.6 3.6-7.2 5.6-10.7c4.4-7.6 9.4-14.7 15-21.3c27.4-32.6 68.5-53.3 114.4-53.3c33.6 0 64.6 11.1 89.6 29.9c9.1 6.9 17.4 14.7 24.8 23.5c5.6 6.6 10.6 13.8 15 21.3c2 3.4 3.8 7 5.5 10.5zm26.4-18.8c-30.1-58.4-91-98.4-161.3-98.4s-131.2 40-161.3 98.4L0 202.7 256 0 512 202.7l-94.7 77.1z"
	/>
</svg>
