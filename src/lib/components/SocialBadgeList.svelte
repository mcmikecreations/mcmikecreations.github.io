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

	export let pill = true;
	export let outline = true;
	export let plain = false;
</script>

<!-- <SocialBadge profile="TUM"><EnvelopeSolid class="w-8 h-8" /></SocialBadge> -->
<SocialBadge profile="GitHub" {size} {padding} {pill} {outline} {plain}><GithubSolid aria-hidden="true" /></SocialBadge>
<SocialBadge profile="LinkedIn" {size} {padding} {pill} {outline} {plain}><LinkedinSolid aria-hidden="true" /></SocialBadge>
<SocialBadge profile="Telegram" {size} {padding} {pill} {outline} {plain}><TelegramSolid aria-hidden="true" /></SocialBadge>
<SocialBadge profile="Google Scholar" {size} {padding} {pill} {outline} {plain}><GoogleScholarSolid aria-hidden="true" /></SocialBadge>
<SocialBadge profile="ResearchGate" {size} {padding} {pill} {outline} {plain}><ResearchGateSolid aria-hidden="true" /></SocialBadge>
<SocialBadge profile="Orcid" {size} {padding} {pill} {outline} {plain}><OrcidSolid aria-hidden="true" /></SocialBadge>
<SocialBadge profile="Mastodon" {size} {padding} {pill} {outline} {plain}><MastodonSolid aria-hidden="true" /></SocialBadge>
<SocialBadge profile="Facebook" {size} {padding} {pill} {outline} {plain}><FacebookSolid aria-hidden="true" /></SocialBadge>
<SocialBadge profile="Instagram" {size} {padding} {pill} {outline} {plain}><InstagramSolid aria-hidden="true" /></SocialBadge>
<SocialBadge profile="X" {size} {padding} {pill} {outline} {plain}><XCompanySolid aria-hidden="true" /></SocialBadge>
