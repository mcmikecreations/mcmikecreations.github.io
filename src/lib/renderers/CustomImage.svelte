<script lang="ts">
	import { Img } from 'flowbite-svelte';

	interface Props {
		href?: string;
		title?: any;
		text?: string;
	}

	let { href = '', title = undefined, text = '' }: Props = $props();
</script>

<Img src={href} {title} alt={text} size="max-w-sm md:max-w-md" figClass="mx-auto" />
