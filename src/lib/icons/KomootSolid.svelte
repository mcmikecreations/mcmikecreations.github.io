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
		ariaLabel = 'komoot solid',
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
	viewBox="0 0 24 24"
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
	<path
		d="M9.8 14.829l2.2-3.43 2.2 3.43 5.962 5.962A11.946 11.946 0 0 1 12 24c-3.043 0-5.935-1.14-8.162-3.209zM0 12C0 5.385 5.385 0 12 0c6.62 0 12 5.385 12 12 0 2.663-.855 5.175-2.469 7.284l-6.018-6.018c.15-.412.226-.839.226-1.27A3.743 3.743 0 0 0 12 8.257a3.743 3.743 0 0 0-3.739 3.739c0 .431.075.858.226 1.27l-6.018 6.018A11.865 11.865 0 0 1 0 12Z"
	/>
</svg>