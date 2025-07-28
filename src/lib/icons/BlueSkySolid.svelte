<!-- @migration-task Error while migrating Svelte code: $$props is used together with named props in a way that cannot be automatically migrated. -->
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

	export let ariaLabel = 'google scholar solid';
</script>

<svg
	xmlns="http://www.w3.org/2000/svg"
	fill="currentColor"
	{...$$restProps}
	class={twMerge('shrink-0', sizes[size], $$props.class)}
	{role}
	aria-label={ariaLabel}
	viewBox="0 0 600 530"
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
	<!--!Font Awesome Free 6.5.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.-->
	<path
		fill="currentColor"
		d="m135.72 44.03c66.496 49.921 138.02 151.14 164.28 205.46 26.262-54.316 97.782-155.54 164.28-205.46 47.98-36.021 125.72-63.892 125.72 24.795 0 17.712-10.155 148.79-16.111 170.07-20.703 73.984-96.144 92.854-163.25 81.433 117.3 19.964 147.14 86.092 82.697 152.22-122.39 125.59-175.91-31.511-189.63-71.766-2.514-7.3797-3.6904-10.832-3.7077-7.8964-0.0174-2.9357-1.1937 0.51669-3.7077 7.8964-13.714 40.255-67.233 197.36-189.63 71.766-64.444-66.128-34.605-132.26 82.697-152.22-67.108 11.421-142.55-7.4491-163.25-81.433-5.9562-21.282-16.111-152.36-16.111-170.07 0-88.687 77.742-60.816 125.72-24.795z"
	/>
</svg>
