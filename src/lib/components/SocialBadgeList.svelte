<script>
	import { FacebookSolid, GithubSolid, LinkedinSolid, XCompanySolid } from 'flowbite-svelte-icons';
import SocialBadge from '$lib/components/SocialBadge.svelte';
	import {
		GoogleScholarSolid,
		InstagramSolid,
		MastodonSolid,
		OrcidSolid,
		ResearchGateSolid,
		TelegramSolid
	} from '$lib/icons';

	export let size = 'child:!size-4 child:xl:!size-8';
	export let padding = '!p-2 xl:!p-4';
</script>

<!-- <SocialBadge profile="TUM"><EnvelopeSolid class="w-8 h-8" /></SocialBadge> -->
<SocialBadge profile="GitHub" {size} {padding}><GithubSolid aria-hidden="true" /></SocialBadge>
<SocialBadge profile="LinkedIn" {size} {padding}><LinkedinSolid aria-hidden="true" /></SocialBadge>
<SocialBadge profile="Telegram" {size} {padding}><TelegramSolid aria-hidden="true" /></SocialBadge>
<SocialBadge profile="Google Scholar" {size} {padding}><GoogleScholarSolid aria-hidden="true" /></SocialBadge>
<SocialBadge profile="ResearchGate" {size} {padding}><ResearchGateSolid aria-hidden="true" /></SocialBadge>
<SocialBadge profile="Orcid" {size} {padding}><OrcidSolid aria-hidden="true" /></SocialBadge>
<SocialBadge profile="Mastodon" {size} {padding}><MastodonSolid aria-hidden="true" /></SocialBadge>
<SocialBadge profile="Facebook" {size} {padding}><FacebookSolid aria-hidden="true" /></SocialBadge>
<SocialBadge profile="Instagram" {size} {padding}><InstagramSolid aria-hidden="true" /></SocialBadge>
<SocialBadge profile="X" {size} {padding}><XCompanySolid aria-hidden="true" /></SocialBadge>
