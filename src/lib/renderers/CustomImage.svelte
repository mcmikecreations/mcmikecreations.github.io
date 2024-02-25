<script>
	import { Img } from 'flowbite-svelte';

	export let href = '';
	export let title = undefined;
	export let text = '';
</script>

<Img src={href} {title} alt={text} size="max-w-sm md:max-w-md" figClass="mx-auto" imgClass="mx-auto" />
