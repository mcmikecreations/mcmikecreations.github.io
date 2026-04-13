<script>
	export let header
	export let align
</script>

{#if header}
	<th style:text-align={align}><slot></slot></th>
{:else}
	<td style:text-align={align}><slot></slot></td>
{/if}
