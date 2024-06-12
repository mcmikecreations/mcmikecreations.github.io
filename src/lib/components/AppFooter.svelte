<script lang="ts">
import resume from '$lib/data/resume.json';
import { page } from '$app/stores';
import { Footer, FooterCopyright, FooterIcon, Tooltip } from 'flowbite-svelte';
import { EnvelopeSolid, FacebookSolid, GithubSolid, LinkedinSolid, XCompanySolid } from 'flowbite-svelte-icons';
import {
	GoogleScholarSolid,
	InstagramSolid,
	MastodonSolid,
	OrcidSolid,
	ResearchGateSolid,
	TelegramSolid
} from '$lib/icons';

export let shouldPinBottom : 'true' | 'false' | undefined = undefined;
export let shouldShowSocials : 'true' | 'false' | undefined = undefined;

$: pinBottom = shouldPinBottom !== undefined ? (shouldPinBottom === 'true') : ($page.data.footer?.pinBottom ?? false);
$: showSocials = shouldShowSocials !== undefined ? (shouldShowSocials === 'true') : ($page.data.footer?.showSocials ?? true);
</script>

<Footer footerType={pinBottom ? "default" : "socialmedia"} class={pinBottom ? "absolute bottom-0 start-0 z-20 w-full" : undefined}>
	<div class="mx-auto flex flex-wrap {showSocials ? 'justify-between' : 'justify-center'} items-center container overflow-hidden">
		<FooterCopyright href="/" by={resume.basics.name} year={new Date().getFullYear()} />
		{#if showSocials}
			<div class="flex flex-wrap -ms-6 md:justify-center mt-0 [&_svg]:w-4 [&_svg]:h-4 [&_svg]:text-gray-500 [&_svg]:dark:text-gray-500 [&_svg:hover]:text-gray-900 [&_svg:hover]:dark:text-white">
				<FooterIcon href={resume.basics.profiles.find(x => x.network === 'TUM')?.url} class="ms-6 mt-4 md:mt-0" aria-label="email solid">
					<EnvelopeSolid ariaLabel="email" />
				</FooterIcon>
				<FooterIcon href={resume.basics.profiles.find(x => x.network === 'GitHub')?.url} class="ms-6 mt-4 md:mt-0">
					<GithubSolid ariaLabel="github" />
				</FooterIcon>
				<FooterIcon href={resume.basics.profiles.find(x => x.network === 'LinkedIn')?.url} class="ms-6 mt-4 md:mt-0">
					<LinkedinSolid ariaLabel="linkedin" />
				</FooterIcon>
				<FooterIcon href={resume.basics.profiles.find(x => x.network === 'Telegram')?.url} class="ms-6 mt-4 md:mt-0">
					<TelegramSolid ariaLabel="telegram" />
				</FooterIcon>
				<FooterIcon href={resume.basics.profiles.find(x => x.network === 'Google Scholar')?.url} class="ms-6 mt-4 md:mt-0">
					<GoogleScholarSolid ariaLabel="google scholar" />
				</FooterIcon>
				<FooterIcon href={resume.basics.profiles.find(x => x.network === 'ResearchGate')?.url} class="ms-6 mt-4 md:mt-0">
					<ResearchGateSolid ariaLabel="research gate" />
				</FooterIcon>
				<FooterIcon href={resume.basics.profiles.find(x => x.network === 'Orcid')?.url} class="ms-6 mt-4 md:mt-0">
					<OrcidSolid ariaLabel="orcid" />
				</FooterIcon>
				<FooterIcon href={resume.basics.profiles.find(x => x.network === 'Mastodon')?.url} class="ms-6 mt-4 md:mt-0">
					<MastodonSolid ariaLabel="mastodon" />
				</FooterIcon>
				<FooterIcon href={resume.basics.profiles.find(x => x.network === 'Facebook')?.url} class="ms-6 mt-4 md:mt-0">
					<FacebookSolid ariaLabel="facebook" />
				</FooterIcon>
				<Tooltip>Facebook</Tooltip>
				<FooterIcon href={resume.basics.profiles.find(x => x.network === 'Instagram')?.url} class="ms-6 mt-4 md:mt-0">
					<InstagramSolid ariaLabel="instagram" />
				</FooterIcon>
				<FooterIcon href={resume.basics.profiles.find(x => x.network === 'X')?.url} class="ms-6 mt-4 md:mt-0">
					<XCompanySolid ariaLabel="x" />
				</FooterIcon>
			</div>
		{/if}
	</div>
</Footer>
