<script>
	import { TableHead } from 'flowbite-svelte';
	import { setContext } from 'svelte';

	setContext('IsCustomTableHead', true);
</script>

<TableHead><slot></slot></TableHead>
