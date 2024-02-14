<script lang="ts">
	import '../app.pcss';
	import { page } from '$app/stores';
	import {
		Navbar,
		NavBrand,
		NavHamburger,
		NavUl,
		NavLi,
		DarkMode,
		Footer,
		FooterCopyright,
		FooterIcon, Tooltip
	} from 'flowbite-svelte';
	import {
		EnvelopeSolid,
		FacebookSolid,
		GithubSolid,
		LinkedinSolid,
		XCompanySolid,
	} from 'flowbite-svelte-icons';
	import {
		GoogleScholarSolid,
		InstagramSolid,
		MastodonSolid,
		OrcidSolid,
		ResearchGateSolid,
		TelegramSolid
	} from '$lib/icons';

	import resume from '$lib/data/resume.json';

	$: activeUrl = $page.url.pathname;
</script>

<Navbar class="dark:bg-gray-800">
	<NavBrand href="/">
		<span class="self-center whitespace-nowrap text-xl font-semibold dark:text-white">Mykola Morozov</span>
	</NavBrand>
	<div class="flex md:order-2">
		<DarkMode />
		<NavHamburger />
	</div>
	<NavUl {activeUrl}>
		<NavLi href="/">Home</NavLi>
		<NavLi href="/resume">Resume</NavLi>
		<NavLi href="/projects">Projects</NavLi>
		<NavLi href="/blog">Blog</NavLi>
		<NavLi href="/contact">Contact</NavLi>
	</NavUl>
</Navbar>

<slot />

<Footer footerType="socialmedia">
	<div class="mx-auto flex flex-wrap justify-between items-center container overflow-hidden">
		<FooterCopyright href="/" by="Mykola Morozov" year={new Date().getFullYear()} />
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
	</div>
</Footer>
