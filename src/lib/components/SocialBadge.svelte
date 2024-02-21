<script>
	import { Button, Span } from 'flowbite-svelte';

	export let profile = {
		network: '',
		username: '',
		url: ''
	};
</script>

<div class="flex flex-row gap-4 items-center">
	<Button href={profile.url} color="alternative" class="!p-2 xl:!p-4" pill outline>
		<slot />
	</Button>
	<Span class="text-md xl:text-xl">{profile.network}</Span>
</div>