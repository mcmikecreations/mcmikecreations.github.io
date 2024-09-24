<script lang="ts">
	import resume from '$lib/data/resume.json';
	import { Button, Heading } from 'flowbite-svelte';
	import SocialBadgeList from '$lib/components/SocialBadgeList.svelte';
</script>

<div class="w-full h-full max-w-xl mx-auto px-4 pt-16 pb-8">
	<div class="flex flex-col items-center">
		<div class="size-24 mx-auto mb-4 rounded-full
				shadow-[inset_0_0_20px_rgb(0_0_0_/_0.50)]
				bg-[url('/images/profile_cropped.jpg')]
				bg-cover bg-center"
		/>
		<Heading tag="h1" class="text-ellipsis text-balance text-center text-xl font-bold leading-6 mx-3">
			{resume.basics.name}
		</Heading>
		<Heading tag="h2" class="text-ellipsis text-balance text-center text-base font-medium leading-6 mt-0.5 mx-6">
			{resume.basics.label}
		</Heading>
		<div class="mt-4 flex flex-wrap gap-4 justify-center">
			<SocialBadgeList size="child:!size-8" padding="!p-2 xl:!p-3" plain />
		</div>
		<div class="mt-8 w-full flex flex-col gap-4 child:min-h-16 child:px-11 child:!text-base child:!font-medium child:!leading-6">
			<Button href="/" color="alternative" pill outline>Website</Button>
			<Button href="https://www.daad-freundeskreis.de/de/regionalgruppen/standort/regionalgruppe-muenchen/" color="alternative" pill outline>Volunteering</Button>
		</div>
	</div>
</div>