<script>
	import { A, Heading, Span } from 'flowbite-svelte';
	import resume from '$lib/data/resume.json';
	import SocialBadgeList from '$lib/components/SocialBadgeList.svelte';

	const educationEmail = resume.basics.profiles.find(x => x.network === 'TUM')?.url ?? '';
	const workEmail = resume.basics.profiles.find(x => x.network === 'Group107')?.url ?? '';
</script>

<section id="contact">
	<Heading tag="h2" class="text-center mt-8">Get In Touch</Heading>
	<div class="flex max-w-2xl mx-auto mt-8">
		<div class="basis-1/2 sm:basis-2/3 flex flex-wrap gap-4 mx-4 2xl:mx-0">
			<SocialBadgeList />
		</div>
		<div class="basis-1/2 sm:basis-1/3 flex flex-col mx-4 2xl:mx-0">
			<Heading tag="h4">Email</Heading>
			<A href={'mailto:'+resume.basics.email}>{resume.basics.email}</A><br>
			<A href={educationEmail}>{educationEmail.replace('mailto:','')}</A><br>
			<A href={workEmail}>{workEmail.replace('mailto:','')}</A><br>
			<div class="flex-grow" />
			<Span>{`${resume.basics.location.city}, ${resume.basics.location.region}, ${resume.basics.location.countryCode}`}</Span>
		</div>
	</div>
</section>