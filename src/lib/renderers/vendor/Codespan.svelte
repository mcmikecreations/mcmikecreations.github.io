<script>
	export let text;
	export let raw;
</script>

<code>{(text ?? raw)?.replace(/`/g, '')}</code>
