<script lang="ts">
	/* eslint-disable @typescript-eslint/ban-ts-comment */
	import type { PageData } from './$types';
	import { Breadcrumb, BreadcrumbItem, Heading, A } from 'flowbite-svelte';
	import {
		ClockOutline,
		MapPinOutline,
		ArrowUpOutline,
		ArrowDownOutline,
		ArrowLeftOutline
	} from 'flowbite-svelte-icons';
	import ToTopButton from '$lib/components/ToTopButton.svelte';
	import MediaGallery from '$lib/components/MediaGallery.svelte';
	import type { GalleryItem } from '$lib/renderers/gallery-item';
	import { getDistance, getTime } from '$lib/hikes/build-statistics';
	import { onMount } from 'svelte';
	import 'leaflet/dist/leaflet.css';
	import AppMeta from '$lib/components/AppMeta.svelte';
	import resume from '$lib/data/resume.json';
	import HikeJsonLd from '../components/HikeJsonLd.svelte';
	import { hikePostTitle } from '$lib/hikes/hikes-meta';
	import AppBreadcrumbs from '$lib/components/AppBreadcrumbs.svelte';
	import { parseMarkdown } from '$lib/hikes/hikes-info';
	import HikeContacts from '../components/HikeContacts.svelte';
	import { initMap2d } from '$lib/hikes/map-2d';
	import { initElevationChart } from '$lib/hikes/map-elevation';
	import { initMap3d } from '$lib/hikes/map-3d';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();
	let allHikesLink = $derived(data.post.page > 1 ? `/hikes/page/${data.post.page}/#${data.post.anchor}` : `/hikes/#${data.post.anchor}`);

	let fullResImageSrc = $state<string | undefined>(undefined);
	let fullImageLoaded = $state(false);

	let galleryOpen = $state(false);
	let galleryIndex = $state(0);

	// The header image takes slide 0 when the post has one, so the markdown items start one slide later.
	const headerOffset = $derived(data.post.imageFull ? 1 : 0);
	const galleryItems = $derived(buildGalleryItems());

	function buildGalleryItems(): GalleryItem[] {
		const full = data.post.imageFull;
		if (!full) return data.post.media;
		const header: GalleryItem = {
			kind: 'image',
			src: full,
			// The thumb doubles as the blurred stand-in while the full image loads.
			placeholder: data.post.image !== full ? data.post.image : undefined,
			alt: data.post.title
		};
		return [header, ...data.post.media];
	}

	function openGallery(slide: number) {
		galleryIndex = slide;
		galleryOpen = true;
	}

	function openHeaderImage() {
		// The full resolution image is fetched lazily and never on small screens,
		// so make sure its request is under way before slide 0 appears.
		if (data.post.imageFull && !fullResImageSrc) {
			fullResImageSrc = data.post.imageFull;
		}
		openGallery(0);
	}

	interface File {
		path: string;
		type: string;
	}
	const filePrimary: File = $derived({
		path: data.display.filePrimary,
		type: 'GeoJSON'
	});
	const fileGpx: File = $derived({
		path: data.display.fileGpx,
		type: 'GPX'
	});

	onMount(async () => {
		// Delay loading of the full resolution image to allow other assets to finish loading first
		if (data.post.imageFull) {
			window.addEventListener('load', () => {
				setTimeout(() => {
					fullResImageSrc = data.post.imageFull;
				}, 100);
			});
			// Fallback in case window load already fired
			setTimeout(() => {
				if (!fullResImageSrc) {
					fullResImageSrc = data.post.imageFull;
				}
			}, 1000);
		}

		const contentEl = document.getElementById('content');
		if (contentEl) {
			if (contentEl.children.length == 0) {
				if (!data.clientHtml) {
					const dateStr = data.post.date;
					const date = data.map.properties.dates.find((d: any) => d.date === dateStr);
					if (date && date.path) {
						const res = await fetch(date.path);
						if (res.ok) {
							const postRaw = await res.text();
							// @ts-ignore
							data.clientHtml = (await parseMarkdown(postRaw)).html;
						}
					}
				}

				// @ts-ignore
				contentEl.innerHTML = data.clientHtml;
			}

			// Only images open the gallery.
			const images = contentEl.querySelectorAll<HTMLImageElement>('img[data-media-index]');
			images.forEach((img) => {
				img.addEventListener('click', () => {
					const mediaIndex = Number(img.dataset.mediaIndex);
					if (Number.isInteger(mediaIndex)) openGallery(mediaIndex + headerOffset);
				});
			});

			const geojsonRes = await fetch(data.map.properties.filePath);
			if (geojsonRes.ok) {
				const geojson = await geojsonRes.json();
				const paragraphs = contentEl.querySelectorAll('p');

				const anchorEl = (index: number): Element =>
					paragraphs[index] ?? paragraphs[paragraphs.length - 1] ?? contentEl;

				const offset = data.post.tags.includes('Climb') ? 1 : 0;

				// 3D map (Three.js) - after 1st paragraph
				const map3dWrapper = document.createElement('div');
				map3dWrapper.className = 'w-full mx-auto not-prose my-4';
				const map3dInner = document.createElement('div');
				map3dInner.style.cssText = 'position: relative; width: 100%; aspect-ratio: 1 / 1; overflow: hidden;';
				const map3dEl = document.createElement('div');
				map3dEl.style.cssText = 'position: absolute; inset: 0;';
				map3dInner.appendChild(map3dEl);
				map3dWrapper.appendChild(map3dInner);
				anchorEl(offset).insertAdjacentElement('afterend', map3dWrapper);

				// Elevation chart - directly below the 3D map
				const map3dElevWrapper = document.createElement('div');
				map3dElevWrapper.className = 'w-full mx-auto not-prose';
				map3dWrapper.insertAdjacentElement('afterend', map3dElevWrapper);

				// 2D interactive map (Leaflet.js) - after 2nd paragraph
				const map2dWrapper = document.createElement('div');
				map2dWrapper.className = 'w-full mx-auto not-prose my-4';
				const map2dInner = document.createElement('div');
				map2dInner.style.cssText = 'position: relative; isolation: isolate; width: 100%; aspect-ratio: 1 / 1; overflow: hidden;';
				const map2dEl = document.createElement('div');
				map2dEl.style.cssText = 'position: absolute; inset: 0;';
				map2dInner.appendChild(map2dEl);
				map2dWrapper.appendChild(map2dInner);
				anchorEl(offset + 1).insertAdjacentElement('afterend', map2dWrapper);

				// Elevation chart - directly below the 2D map
				const elevWrapper = document.createElement('div');
				elevWrapper.className = 'w-full mx-auto not-prose';
				map2dWrapper.insertAdjacentElement('afterend', elevWrapper);

				const map3dHandle = initMap3d(map3dEl, geojson, data.map);
				const map2dHandle = await initMap2d(map2dEl, geojson, data.map.properties.nodes);

				let elev3dHandle: { setIndicator: (lat: number, lon: number, preferredDist?: number) => void; hideIndicator: () => void };
				let elev2dHandle: { setIndicator: (lat: number, lon: number, preferredDist?: number) => void; hideIndicator: () => void };

				const hideAllIndicators = () => {
					elev3dHandle?.hideIndicator();
					elev2dHandle?.hideIndicator();
					map2dHandle.hideIndicator?.();
					map3dHandle.hideIndicator?.();
				};

				// Each chart updates the maps and the OTHER chart.
				elev3dHandle = initElevationChart(map3dElevWrapper, geojson, (lat, lon, ele, dist) => {
					map2dHandle.setIndicator(lat, lon);
					map3dHandle.setIndicator(lat, lon, ele);
					elev2dHandle?.setIndicator(lat, lon, dist);
				}, hideAllIndicators, data.map.properties);
				elev2dHandle = initElevationChart(elevWrapper, geojson, (lat, lon, ele, dist) => {
					map2dHandle.setIndicator(lat, lon);
					map3dHandle.setIndicator(lat, lon, ele);
					elev3dHandle?.setIndicator(lat, lon, dist);
				}, hideAllIndicators, data.map.properties);
			}
		}
	});
</script>

<AppMeta
	title={hikePostTitle(data.post.title)}
	description={data.post.description ?? undefined}
	image={data.post.image}
	type="article"
	tags={data.post.tags}
	article-published_time="{data.post.date}T16:00:00+00:00"
	article-author={resume.basics.name}
	article-section="Hikes"
/>
<AppBreadcrumbs items={[
	{ name: 'Home', href: '/' },
	{ name: 'Hikes', href: '/hikes/' },
	{ name: data.post.title, href: `/hikes/${data.post.anchor}/` }
]} />
<HikeJsonLd
	variant="post"
	title={data.post.title}
	description={data.post.description ?? ''}
	image={data.post.image}
	date={data.post.date}
	author={data.post.author}
	tags={data.post.tags}
	anchor={data.post.anchor}
	distance={data.map.properties.distance}
	ascent={data.map.properties.ascent}
	descent={data.map.properties.descent}
	duration={data.map.properties.duration}
/>

<div class="container mx-auto">
	<div class="mx-4 2xl:mx-0 md:px-24 mb-8">
		<article class="mx-auto">
			<div class="mx-auto prose dark:prose-invert prose-a:text-primary-600 dark:prose-a:text-primary-500 md:prose-lg lg:prose-xl min-h-80">
				<div class="mt-2 flex md:hidden">
					<A href={allHikesLink} class="inline-flex items-center">
						<ArrowLeftOutline class="w-5 h-5 me-2" />
						Back to All Hikes
					</A>
				</div>
				<Breadcrumb aria-label="Page path" class="mt-4 not-prose hidden md:flex">
					<BreadcrumbItem href="/" home>Home</BreadcrumbItem>
					<BreadcrumbItem href={allHikesLink}>Hikes</BreadcrumbItem>
					<BreadcrumbItem>{data.post.title}</BreadcrumbItem>
				</Breadcrumb>
				<Heading tag="h1" class="!mb-0 !mt-2">{data.post.title}</Heading>
				<div class="flex flex-row flex-wrap gap-2 !mt-2 !mb-4">
					<span>{data.post.author}</span>
					·
					<span>{data.post.time}</span>
					·
					<a class="no-underline hover:underline" href="/hikes/year/{new Date(data.post.date).getFullYear()}/">{new Date(data.post.date).toLocaleDateString('en-us', { year:"numeric", month:"short", day:"numeric"})}</a>
					{#if data.post.tags?.length}
						·
						<div class="flex flex-row flex-wrap justify-end gap-2 items-center" aria-details="tags">
							<span aria-label="tags" class="sr-only"></span>
							{#each data.post.tags as t}
								<a class="bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-300 px-2.5 py-0.5 rounded-sm no-underline hover:bg-primary-200 dark:hover:bg-primary-800" href="/hikes/tag/{encodeURIComponent(t)}/">{t}</a>
							{/each}
						</div>
					{/if}
				</div>
				<div>
					<div class="flex flex-col md:flex-row gap-6 mb-6 not-prose w-full max-w-none">
						{#if data.post.imageFull}
							<div class="relative w-full md:w-48 lg:w-[24rem] aspect-video md:aspect-auto m-0 shrink-0 rounded-lg md:rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
								<img src={data.post.image} alt={data.post.title} class="absolute inset-0 w-full h-full object-cover m-0 {fullImageLoaded ? 'opacity-0 delay-500' : 'opacity-100'} transition-opacity duration-1000" />
								{#if fullResImageSrc}
									<picture class="absolute inset-0 w-full h-full m-0">
										<source media="(min-width: 768px)" srcset={fullResImageSrc} />
										<img src={data.post.image} alt={data.post.title} class="w-full h-full object-cover m-0 transition-opacity duration-500 {fullImageLoaded ? 'opacity-100' : 'opacity-0'}" onload={() => fullImageLoaded = true} />
									</picture>
								{/if}
								<button
									type="button"
									aria-label="Expand image"
									onclick={openHeaderImage}
									class="absolute inset-0 w-full h-full cursor-pointer bg-transparent border-0 p-0 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary-500 focus-visible:outline-hidden"
								></button>
							</div>
						{/if}
						<div class="flex w-full flex-col justify-center">
							<div class="flex flex-row flex-wrap gap-x-4 gap-y-4 md:gap-x-6 md:gap-y-6 my-2">
								<div class="flex items-center gap-3 basis-[140px] grow">
									<div class="text-primary-600 dark:text-primary-500 bg-primary-100 dark:bg-primary-900 rounded-lg p-2 shrink-0">
										<ClockOutline class="w-6 h-6" />
									</div>
									<div>
										<div class="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Duration*</div>
										<div class="font-semibold whitespace-nowrap">{getTime(data.map.properties.duration ?? 0)}</div>
									</div>
								</div>
								<div class="flex items-center gap-3 basis-[140px] grow">
									<div class="text-primary-600 dark:text-primary-500 bg-primary-100 dark:bg-primary-900 rounded-lg p-2 shrink-0">
										<MapPinOutline class="w-6 h-6" />
									</div>
									<div>
										<div class="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Distance</div>
										<div class="font-semibold whitespace-nowrap">{getDistance(data.map.properties.distance ?? 0)}</div>
									</div>
								</div>
								<div class="flex items-center gap-3 basis-[140px] grow">
									<div class="text-primary-600 dark:text-primary-500 bg-primary-100 dark:bg-primary-900 rounded-lg p-2 shrink-0">
										<ArrowUpOutline class="w-6 h-6" />
									</div>
									<div>
										<div class="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Ascent</div>
										<div class="font-semibold whitespace-nowrap">{getDistance(data.map.properties.ascent ?? 0)}</div>
									</div>
								</div>
								<div class="flex items-center gap-3 basis-[140px] grow">
									<div class="text-primary-600 dark:text-primary-500 bg-primary-100 dark:bg-primary-900 rounded-lg p-2 shrink-0">
										<ArrowDownOutline class="w-6 h-6" />
									</div>
									<div>
										<div class="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Descent</div>
										<div class="font-semibold whitespace-nowrap">{getDistance(data.map.properties.descent ?? 0)}</div>
									</div>
								</div>
							</div>
							<div class="text-sm text-gray-500 dark:text-gray-400 mt-2">
								* Duration is pure net walking time in summer with above average speed.
							</div>
							{#if data.display.filePrimary || data.display.fileGpx}
								<blockquote class="!mb-0 mt-4 border-l-4 border-gray-300 dark:border-gray-600 pl-4 py-1 italic text-gray-600 dark:text-gray-400">
									Grab the
									{#if data.display.fileGpx && data.display.filePrimary}
										<A href={fileGpx.path} download={fileGpx.path.substring(fileGpx.path.lastIndexOf('/') + 1)}>{fileGpx.type}</A>
										or
									{:else if data.display.fileGpx}
										<A href={fileGpx.path} download={fileGpx.path.substring(fileGpx.path.lastIndexOf('/') + 1)}>{fileGpx.type}</A>
									{/if}
									{#if data.display.filePrimary}
										<A href={filePrimary.path} download={filePrimary.path.substring(filePrimary.path.lastIndexOf('/') + 1)}>{filePrimary.type}</A>
									{/if}
									file and embark on your own adventure!
								</blockquote>
							{/if}
						</div>
					</div>
					<div id="content">
						{@html data.clientHtml ?? '%%SSR_POST_CONTENT%%'}
					</div>
					<HikeContacts contacts={data.contacts} />
				</div>
			</div>
		</article>
	</div>
</div>

<MediaGallery items={galleryItems} bind:open={galleryOpen} index={galleryIndex} />

<ToTopButton />
