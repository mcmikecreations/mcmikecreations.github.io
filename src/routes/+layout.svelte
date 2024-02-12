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

	import * as socials from '$lib/data/social.json';

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
			<FooterIcon href={socials.facebook} class="ms-6 mt-4 md:mt-0">
				<FacebookSolid class="w-4 h-4 text-gray-500 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white" />
			</FooterIcon>
			<Tooltip>Facebook</Tooltip>
			<FooterIcon href={socials.github} class="ms-6 mt-4 md:mt-0">
				<GithubSolid class="w-4 h-4 text-gray-500 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white" />
			</FooterIcon>
			<FooterIcon href={socials.instagram} class="ms-6 mt-4 md:mt-0">
				<InstagramSolid class="w-4 h-4 text-gray-500 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white" />
			</FooterIcon>
			<FooterIcon href={socials.linkedin} class="ms-6 mt-4 md:mt-0">
				<LinkedinSolid class="w-4 h-4 text-gray-500 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white" />
			</FooterIcon>
			<FooterIcon href={socials.twitter} class="ms-6 mt-4 md:mt-0">
				<XCompanySolid class="w-4 h-4 text-gray-500 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white" />
			</FooterIcon>
			<FooterIcon href={socials.orcid} class="ms-6 mt-4 md:mt-0">
				<OrcidSolid class="w-4 h-4 text-gray-500 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white" />
			</FooterIcon>
			<FooterIcon href={socials.mastodon} class="ms-6 mt-4 md:mt-0">
				<MastodonSolid class="w-4 h-4 text-gray-500 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white" />
			</FooterIcon>
			<FooterIcon href={socials.telegram} class="ms-6 mt-4 md:mt-0">
				<TelegramSolid class="w-4 h-4 text-gray-500 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white" />
			</FooterIcon>
			<FooterIcon href={socials.scholar} class="ms-6 mt-4 md:mt-0">
				<GoogleScholarSolid class="w-4 h-4 text-gray-500 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white" />
			</FooterIcon>
			<FooterIcon href={socials.researchgate} class="ms-6 mt-4 md:mt-0">
				<ResearchGateSolid class="w-4 h-4 text-gray-500 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white" />
			</FooterIcon>
			<FooterIcon href={socials.researchemail} class="ms-6 mt-4 md:mt-0" aria-label="email solid">
				<EnvelopeSolid class="w-4 h-4 text-gray-500 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white" />
			</FooterIcon>
		</div>
	</div>
</Footer>
