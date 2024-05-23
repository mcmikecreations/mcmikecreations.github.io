<script lang="ts">
	export let href = ''
	export let title : string | null | undefined = undefined
</script>

<a data-sveltekit-reload {href} {title}><slot></slot></a>
