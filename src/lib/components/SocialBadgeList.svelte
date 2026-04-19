<script lang="ts">
	import { FacebookSolid, GithubSolid, LinkedinSolid, XSolid } from 'flowbite-svelte-icons';
import SocialBadge from '$lib/components/SocialBadge.svelte';
	import {
		BeRealSolid,
		BlueSkySolid,
		GoogleScholarSolid,
		InstagramSolid,
		MastodonSolid,
		OrcidSolid,
		ResearchGateSolid,
		StravaSolid,
		TelegramSolid
	} from '$lib/icons';


	interface Props {
		size?: string;
		padding?: string;
		pill?: boolean;
		outline?: boolean;
		plain?: boolean;
	}

	let {
		size = '[&>*]:!size-4 xl:[&>*]:!size-8',
		padding = '!p-2 xl:!p-4',
		pill = true,
		outline = true,
		plain = false
	}: Props = $props();
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
<SocialBadge profile="X" {size} {padding} {pill} {outline} {plain}><XSolid aria-hidden="true" /></SocialBadge>
<SocialBadge profile="BlueSky" {size} {padding} {pill} {outline} {plain}><BlueSkySolid aria-hidden="true" /></SocialBadge>
<SocialBadge profile="BeReal" {size} {padding} {pill} {outline} {plain}><BeRealSolid aria-hidden="true" /></SocialBadge>
<SocialBadge profile="Strava" {size} {padding} {pill} {outline} {plain}><StravaSolid aria-hidden="true" /></SocialBadge>
