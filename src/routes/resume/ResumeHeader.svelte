<script>
	import resume from '$lib/data/resume.json';
	import SocialBadgeList from '$lib/components/SocialBadgeList.svelte';
	import { A, Heading, P, Span, Tooltip } from 'flowbite-svelte';

	const educationEmail = resume.basics.profiles.find(x => x.network === 'TUM')?.url ?? '';
	const workEmail = resume.basics.profiles.find(x => x.network === 'Group107')?.url ?? '';
</script>

<div class="mt-8 mx-4 2xl:mx-0 flex flex-row flex-wrap gap-8">
	<div class="size-60 mx-auto rounded-full
				shadow-[inset_0_0_20px_rgb(0_0_0_/_0.50)]
				bg-[url('/images/profile_cropped.jpg')]
				bg-cover bg-center"
	/>
	<div class="flex-1 flex flex-col gap-2 justify-center">
		<div class="flex flex-row flex-wrap gap-4 mb-4">
			<div>
				<Heading tag="h1" class="text-4xl font-bold mb-2">{resume.basics.name}</Heading>
				<P>
					{resume.basics.label}
					{#each resume.languages as lang}
						<span class="px-1">{lang.emoji}</span>
						<Tooltip>{lang.fluency}</Tooltip>
					{/each}
				</P>
			</div>
			<div class="flex-grow flex flex-wrap gap-4 justify-center sm:justify-end">
				<SocialBadgeList size="child:!size-4 child:xl:!size-6" padding="!p-2 xl:!p-3" />
			</div>
		</div>
		<div class="flex flex-row-reverse flex-wrap justify-end gap-2">
			<div>
				<A href={'mailto:'+resume.basics.email}>{resume.basics.email}</A><br>
				<A href={educationEmail}>{educationEmail.replace('mailto:','')}</A><br>
				<A href={workEmail}>{workEmail.replace('mailto:','')}</A><br>
				<Span>{`${resume.basics.location.city}, ${resume.basics.location.region}, ${resume.basics.location.countryCode}`}</Span>
			</div>
			<P class="flex-1 min-w-60">{resume.basics.summary}</P>
		</div>
	</div>
</div>
