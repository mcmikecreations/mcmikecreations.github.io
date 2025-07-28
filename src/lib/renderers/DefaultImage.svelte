<script lang="ts">
	interface Props {
		href?: string;
		title?: any;
		text?: string;
	}

	let { href = '', title = undefined, text = '' }: Props = $props();
</script>

<figure class="w-full xl:w-1/2 mx-auto">
	<img src={href} {title} alt={text} />
	<figcaption class="text-center">{text}</figcaption>
</figure>
