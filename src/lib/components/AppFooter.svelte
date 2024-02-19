<script>
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

export let pinBottom = $page.data.footer?.pinBottom ?? false;
export let showSocials = $page.data.footer?.showSocials ?? true;
</script>

<Footer footerType={pinBottom ? "default" : "socialmedia"} class={pinBottom ? "absolute bottom-0 start-0 z-20 w-full" : undefined}>
	<div class="mx-auto flex flex-wrap {showSocials ? 'justify-between' : 'justify-center'} items-center container overflow-hidden">
		<FooterCopyright href="/" by={resume.basics.name} year={new Date().getFullYear()} />
		{#if showSocials}
			<div class="flex flex-wrap -ms-6 md:justify-center mt-0">
				<FooterIcon href={resume.basics.profiles.find(x => x.network === 'TUM')?.url} class="ms-6 mt-4 md:mt-0" aria-label="email solid">
					<EnvelopeSolid class="w-4 h-4 text-gray-500 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white" />
				</FooterIcon>
				<FooterIcon href={resume.basics.profiles.find(x => x.network === 'GitHub')?.url} class="ms-6 mt-4 md:mt-0">
					<GithubSolid class="w-4 h-4 text-gray-500 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white" />
				</FooterIcon>
				<FooterIcon href={resume.basics.profiles.find(x => x.network === 'LinkedIn')?.url} class="ms-6 mt-4 md:mt-0">
					<LinkedinSolid class="w-4 h-4 text-gray-500 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white" />
				</FooterIcon>
				<FooterIcon href={resume.basics.profiles.find(x => x.network === 'Telegram')?.url} class="ms-6 mt-4 md:mt-0">
					<TelegramSolid class="w-4 h-4 text-gray-500 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white" />
				</FooterIcon>
				<FooterIcon href={resume.basics.profiles.find(x => x.network === 'Google Scholar')?.url} class="ms-6 mt-4 md:mt-0">
					<GoogleScholarSolid class="w-4 h-4 text-gray-500 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white" />
				</FooterIcon>
				<FooterIcon href={resume.basics.profiles.find(x => x.network === 'ResearchGate')?.url} class="ms-6 mt-4 md:mt-0">
					<ResearchGateSolid class="w-4 h-4 text-gray-500 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white" />
				</FooterIcon>
				<FooterIcon href={resume.basics.profiles.find(x => x.network === 'Orcid')?.url} class="ms-6 mt-4 md:mt-0">
					<OrcidSolid class="w-4 h-4 text-gray-500 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white" />
				</FooterIcon>
				<FooterIcon href={resume.basics.profiles.find(x => x.network === 'Mastodon')?.url} class="ms-6 mt-4 md:mt-0">
					<MastodonSolid class="w-4 h-4 text-gray-500 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white" />
				</FooterIcon>
				<FooterIcon href={resume.basics.profiles.find(x => x.network === 'Facebook')?.url} class="ms-6 mt-4 md:mt-0">
					<FacebookSolid class="w-4 h-4 text-gray-500 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white" />
				</FooterIcon>
				<Tooltip>Facebook</Tooltip>
				<FooterIcon href={resume.basics.profiles.find(x => x.network === 'Instagram')?.url} class="ms-6 mt-4 md:mt-0">
					<InstagramSolid class="w-4 h-4 text-gray-500 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white" />
				</FooterIcon>
				<FooterIcon href={resume.basics.profiles.find(x => x.network === 'X')?.url} class="ms-6 mt-4 md:mt-0">
					<XCompanySolid class="w-4 h-4 text-gray-500 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white" />
				</FooterIcon>
			</div>
		{/if}
	</div>
</Footer>
