<script lang="ts">
	/* eslint-disable svelte/no-at-html-tags */
	import type { PageData } from './$types';
	import { onMount } from "svelte";
	import AppFooter from "$lib/components/AppFooter.svelte";
	import AppNavbar from "$lib/components/AppNavbar.svelte";
	import { Badge, Heading, Img, Span } from 'flowbite-svelte';
	import ShowcaseCard from "./components/ShowcaseCard.svelte";
	import { A, P, ImagePlaceholder, CardPlaceholder, Progressbar } from 'flowbite-svelte';
	import { UserSolid } from 'flowbite-svelte-icons';
	import DateBadge from '$lib/components/DateBadge.svelte';
	import AppMeta from '$lib/components/AppMeta.svelte';
	import Footsteps from './components/Footsteps.svelte';
	import Hero from './components/Hero.svelte';
	import FeedSolid from '$lib/icons/FeedSolid.svelte';
	import { FileCodeSolid } from 'flowbite-svelte-icons';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();
	const posts = data.posts;
	const showProgressbar = data.showProgressbar;

	const imagesToLoad = 6;
	let loadedImages = $state(0);
	const heroImages = [
		"/images/hikes/hero/hike_poster_4_bg_2.png",
		"/images/hikes/hero/hike_poster_4.png",
		"/images/hikes/hero/hike_poster_3.png",
		"/images/hikes/hero/hike_poster_2.png",
		"/images/hikes/hero/hike_poster_0.png",
		"/images/hikes/hero/hike_poster_1.png"
	];

	onMount(() => {
		if (showProgressbar) {
			const progressbar = document.getElementById('progressbar');
			heroImages.map(src => {
				const bgImage = new Image();
				bgImage.onload = function() {
					loadedImages += 1;
					if (loadedImages >= imagesToLoad && progressbar) {
						setTimeout(() => {
							progressbar.classList.add('hide');
						}, 150);
					}
				};
				bgImage.src = src;
				return bgImage;
			});
		}

		const fakeHeader = document.getElementById('fake-header');
		function fakeHeaderColor() {
            const scrollY = window.scrollY;
            const windowHeight = window.innerHeight;
            if (fakeHeader) {
                if (scrollY >= windowHeight) {
                    fakeHeader.style.opacity = '0%';
                } else {
                    fakeHeader.style.opacity = '100%';
                }
            }
        }
		fakeHeaderColor();

		window.addEventListener('scroll', () => {
			fakeHeaderColor();
		});
	});
</script>

{#snippet title()}
    <span class="self-center whitespace-nowrap text-xl font-semibold invisible">Mykola Morozov</span>
{/snippet}

<AppMeta
	title="Hiking, Climbing, Via Ferrata & Trail Maps | Personal Hike Experiences"
	description="The most thorough hike reviews on the web"
	type="website"
/>
<svelte:head>
	<link rel="alternate" type="application/rss+xml" title="Mykola's Hiking Blog RSS Feed" href="/hikes/feed.xml" />
	<link rel="alternate" type="application/atom+xml" title="Mykola's Hiking Blog Atom Feed" href="/hikes/atom.xml" />
</svelte:head>

<AppNavbar
    class="fixed z-50 top-0"
    bgClass="bg-white/50 dark:bg-gray-800/50 dark:text-white"
    bgClassUl="backdrop-blur-md bg-white dark:bg-gray-800 md:bg-white/50 md:dark:bg-gray-800/50 text-black dark:text-white"
    {title}
    fillNarrow={true}
    shouldFixNavbar="true"
/>
<Hero />
<Footsteps />
<div class="w-full h-[60px] md:h-[72px] bg-white dark:bg-gray-800 sticky top-0">
    <div id="fake-header" class="transition-all duration-300 absolute z-10 w-full h-full top-0 left-0 bg-white dark:bg-gray-900"></div>
    <div class="mx-auto h-full px-2 py-2.5 sm:px-4 flex flex-wrap items-center justify-between container">
        <a href="/" class="flex items-center">
            <span class="self-center whitespace-nowrap text-xl font-semibold dark:text-white">
                Mykola Morozov
            </span>
        </a>
    </div>
</div>

<section class="container mx-auto my-8">
    <div class="mx-4 2xl:mx-0 md:px-24 mb-8">
        <Heading tag="h2">Projects</Heading>
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-8">
            <ShowcaseCard x={2} y={1} class="lg:col-span-2" href="/hikes/web/" img="/images/hikes/hero/web.jpg">
                <h5 class="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white pb-4">
                    Hiking Web
                </h5>
                <p class="leading-tight text-justify font-normal text-gray-700 dark:text-gray-400 pb-4">
                    An attempt to connect all visited hiking paths into a single network.
                </p>
                <p class="leading-tight text-justify font-normal text-gray-700 dark:text-gray-400 pb-4">
                    All of the simplified hiking routes on the page are fully explorable,
                    some even contain event descriptions and photos from the hike.
										Additional statistics are available regarding the frequency and length of hikes.
                </p>
                <p class="leading-tight text-justify font-normal text-gray-700 dark:text-gray-400 pb-4">
                    The simplified routes are based on the approximate origins and destinations
                    of the hikes and include intersection points with other simplified routes.
                </p>
                <p class="leading-tight text-justify font-normal text-gray-700 dark:text-gray-400">
                    Currently, most of the South Bavarian hikes have been connected.
                </p>
            </ShowcaseCard>
            <ShowcaseCard x={1} y={1} href="/404/" img="/images/hikes/hero/viaferrata.jpg">
                <h5 class="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white pb-4">
                    Via Ferrata
                </h5>
                <p class="leading-tight text-justify font-normal text-gray-700 dark:text-gray-400 pb-4">
                    A set of full-length recordings of via ferrata climbs, with or without gear.
                </p>
                <p class="leading-tight text-justify font-normal text-gray-700 dark:text-gray-400 pb-4">
                    Any attempts to follow these climbs should be done with all necessary gear and
                    utilizing all safety rules, regulations, and equipment.
                </p>
            </ShowcaseCard>
        </div>
        <!--<main></main>-->
    </div>
</section>

<section class="container mx-auto mb-8">
	<div class="mx-4 2xl:mx-0 md:px-24 mb-8">
		<Heading tag="h2">Blog</Heading>
		<div class="mt-8">
			<main>
				<div class="flex flex-col gap-8">
					{#each posts as p}
						<a
							class="flex flex-col md:flex-row w-full md:min-h-48
					rounded-lg shadow-lg
					bg-white dark:bg-gray-800
 					text-gray-500 dark:text-gray-400"
							href={p.url}
							id={p.anchor}
						>
							<div class="block md:max-h-48 md:min-h-48 md:min-w-64 !aspect-crt overflow-hidden">
								{#if p.image}
									<Img src={p.image ?? undefined} class="w-full h-full aspect-crt rounded-t-lg md:rounded-tr-none md:rounded-l-lg object-cover object-center" />
								{/if}
							</div>
							<div class="flex-grow flex flex-col p-4">
								<Heading tag="h3">{p.title}</Heading>
								<Span class="flex-grow pt-4">{@html p.description}</Span>
								<div class="pt-4 w-full flex flex-row">
									<DateBadge date={p.date} dateEnd={undefined} />
									<div class="flex-grow flex flex-row justify-end gap-2" aria-details="tags">
										<span aria-label="tags" class="sr-only"></span>
										{#if data.showPeople && p.people}
											{#each p.people as t}
												<Badge rounded>
													<UserSolid class="me-1.5 size-2.5" />
													{t}
												</Badge>
											{/each}
										{/if}
										{#each p.tags as t}
											<Badge>{t}</Badge>
										{/each}
									</div>
								</div>
							</div>
						</a>
					{/each}
				</div>
			</main>
		</div>
	</div>
</section>

<section class="container mx-auto mb-8">
	<div class="mx-4 2xl:mx-0 md:px-24 flex flex-row justify-between">
		<div>
			<A href="/hikes/feed.xml" data-sveltekit-reload><FeedSolid ariaLabel="RSS Feed" class="me-1" /> RSS Feed</A>
		</div>
		<div>
			<A href="/hikes/atom.xml" data-sveltekit-reload><FeedSolid ariaLabel="Atom Feed" class="me-1" /> Atom Feed</A>
		</div>
		<div>
			<A href="https://raw.githubusercontent.com/mykolamor/mcmikecreations.github.io/refs/heads/feature/svelte-update/src/lib/data/hikes.json"><FileCodeSolid ariaLabel="Json Feed" class="me-1" /> Json Feed</A>
		</div>
	</div>
</section>

<AppFooter class="absolute z-10 left-0 right-0" />

{#if showProgressbar}
	<div id="progressbar" class="fixed w-full h-full top-0 left-0 z-20 overflow-hidden bg-white dark:bg-gray-800">
		<div class="container mx-auto mt-10">
			<div class="mx-4 2xl:mx-0 md:px-24">
				<ImagePlaceholder size="md" class="mb-8" />
				<noscript>
					<P>Enable JavaScript to continue.</P>
				</noscript>
				<Progressbar progress={Math.round(loadedImages / imagesToLoad * 100)} />
				<div class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 justify-items-stretch my-8">
					<CardPlaceholder />
					<CardPlaceholder class="hidden lg:block" />
					<CardPlaceholder class="hidden xl:block" />
				</div>
				<ImagePlaceholder size="sm" />
				<ImagePlaceholder size="sm" class="my-8" />
			</div>
		</div>
	</div>
{/if}

<style>
	#progressbar {
		opacity: 1;
		visibility: visible;
		transition: opacity 0.5s ease-in-out;
		pointer-events: none;
	}

  :global(#progressbar.hide) {
		opacity: 0;
		visibility: hidden;
		transition: opacity 0.5s ease-in-out, visibility 0s 0.5s;
  }
</style>
