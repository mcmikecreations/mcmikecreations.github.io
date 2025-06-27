<script>
	export let href = '';
	export let title = undefined;
	export let text = '';
</script>

<figure class="w-full xl:w-1/2 mx-auto">
	<img src={href} {title} alt={text} />
	<figcaption class="text-center">{text}</figcaption>
</figure>
