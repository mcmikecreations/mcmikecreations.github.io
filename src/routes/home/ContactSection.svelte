<script>
	import { Heading } from 'flowbite-svelte';
	import resume from '$lib/data/resume.json';
	import SocialBadge from '$lib/components/SocialBadge.svelte';
	import { EnvelopeSolid, FacebookSolid, GithubSolid, LinkedinSolid, XCompanySolid } from 'flowbite-svelte-icons';
	import {
		GoogleScholarSolid,
		InstagramSolid,
		MastodonSolid,
		OrcidSolid,
		ResearchGateSolid,
		TelegramSolid
	} from '$lib/icons';
</script>

<section class="container mx-auto md:px-16">
	<Heading tag="h2" class="text-center mt-8">Get In Touch</Heading>
	<div class="flex max-w-2xl mx-auto mt-8">
		<div class="basis-1/2 sm:basis-2/3 grid grid-cols-1 md:grid-cols-2 gap-4 mx-4 2xl:mx-0">
<!--			<SocialBadge profile={resume.basics.profiles.find(x => x.network === 'TUM')}><EnvelopeSolid class="w-8 h-8" /></SocialBadge>-->
			<SocialBadge profile={resume.basics.profiles.find(x => x.network === 'GitHub')}><GithubSolid class="size-4 xl:size-8" /></SocialBadge>
			<SocialBadge profile={resume.basics.profiles.find(x => x.network === 'LinkedIn')}><LinkedinSolid class="size-4 xl:size-8" /></SocialBadge>
			<SocialBadge profile={resume.basics.profiles.find(x => x.network === 'Telegram')}><TelegramSolid class="size-4 xl:size-8" /></SocialBadge>
			<SocialBadge profile={resume.basics.profiles.find(x => x.network === 'Google Scholar')}><GoogleScholarSolid class="size-4 xl:size-8" /></SocialBadge>
			<SocialBadge profile={resume.basics.profiles.find(x => x.network === 'ResearchGate')}><ResearchGateSolid class="size-4 xl:size-8" /></SocialBadge>
			<SocialBadge profile={resume.basics.profiles.find(x => x.network === 'Orcid')}><OrcidSolid class="size-4 xl:size-8" /></SocialBadge>
			<SocialBadge profile={resume.basics.profiles.find(x => x.network === 'Mastodon')}><MastodonSolid class="size-4 xl:size-8" /></SocialBadge>
			<SocialBadge profile={resume.basics.profiles.find(x => x.network === 'Facebook')}><FacebookSolid class="size-4 xl:size-8" /></SocialBadge>
			<SocialBadge profile={resume.basics.profiles.find(x => x.network === 'Instagram')}><InstagramSolid class="size-4 xl:size-8" /></SocialBadge>
			<SocialBadge profile={resume.basics.profiles.find(x => x.network === 'X')}><XCompanySolid class="size-4 xl:size-8" /></SocialBadge>
		</div>
		<div class="basis-1/2 sm:basis-1/3 mx-4 2xl:mx-0">
			World
		</div>
	</div>
</section>