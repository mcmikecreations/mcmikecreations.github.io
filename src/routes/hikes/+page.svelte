<script lang="ts">
    import {getContext, onMount, setContext, type SvelteComponent} from "svelte";
    import DarkModeButton from "$lib/components/DarkModeButton.svelte";
    import AppFooter from "$lib/components/AppFooter.svelte";
    import AppNavbar from "$lib/components/AppNavbar.svelte";
    import { Heading } from "flowbite-svelte";
    import AppToc from "$lib/components/AppToc.svelte";
    import ShowcaseCard from "./components/ShowcaseCard.svelte";

	let parallaxStrength = $state(0.05);

	onMount(() => {
        const footstepsContainer = document.getElementById('footsteps-container');
        function footstepsUpdate() {
            const stepDistanceY = 60;
            const stepDistanceX = 30;
            const scrollY = window.scrollY;

            if (!footstepsContainer) return;
            const stepCount = Math.floor(scrollY / stepDistanceY);
            const oldStepCount = footstepsContainer.children.length;

            const stepOffsetY = window.innerHeight * ((stepCount * stepDistanceY + window.innerHeight) / document.documentElement.scrollHeight);
            const stepOffsetX = 50;

            if (oldStepCount > stepCount) {
                for (let i = stepCount; i < oldStepCount; ++i) {
                    footstepsContainer.removeChild(footstepsContainer.lastChild!);
                }
            } else if (oldStepCount < stepCount) {
                for (let i = oldStepCount; i < stepCount; ++i) {
                    const svgNS = footstepsContainer.getAttribute('xmlns');
                    if (i % 2 === 0) {
                        const footstep = document.createElementNS(svgNS, 'rect') as SVGRectElement;

                        const t = i;
                        const x = stepDistanceX * Math.sin(t);
                        const y = t * stepDistanceY; // vertical position
                        footstep.setAttribute('x', '0');
                        footstep.setAttribute('y', '0');
                        footstep.setAttribute('width', '20');
                        footstep.setAttribute('height', '40');
                        let transform = '';
                        const angle = Math.atan(-Math.cos(t) * stepDistanceX / stepDistanceY);
                        transform += ` translate(${x + stepOffsetX} ${y + stepOffsetY})`;
                        transform += ` rotate(${180 + angle / Math.PI * 180} 10 20)`;
                        transform += `scale(-1 1)`;
                        footstep.setAttribute('transform', transform);
                        footstep.setAttribute('class', 'footstep');

                        footstepsContainer.appendChild(footstep);
                    }
                    else {
                        const footstep = document.createElementNS(svgNS, 'rect') as SVGRectElement;

                        // Curve formula (e.g., sine wave)
                        const t = i;
                        const x = stepDistanceX * Math.sin(t);
                        const y = t * stepDistanceY; // vertical position
                        footstep.setAttribute('x', '0');
                        footstep.setAttribute('y', '0');
                        footstep.setAttribute('width', '20');
                        footstep.setAttribute('height', '40');
                        let transform = '';
                        const angle = Math.atan(-Math.cos(t) * stepDistanceX / stepDistanceY);
                        transform += ` translate(${x + stepOffsetX} ${y + stepOffsetY})`;
                        transform += `scale(1 1)`;
                        transform += ` rotate(${180 + angle / Math.PI * 180} 10 20)`;
                        footstep.setAttribute('transform', transform);
                        footstep.setAttribute('class', 'footstep');

                        footstepsContainer.appendChild(footstep);
                    }
                }
            }
        }
        footstepsUpdate();

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

		window.addEventListener('scroll', () => {
			const scrollY = window.scrollY;
			document.querySelector<HTMLDivElement>('.hero-layer2')!.style.transform = `translateY(${scrollY * parallaxStrength}px)`;
			document.querySelector<HTMLDivElement>('.hero-layer3')!.style.transform = `translateY(${scrollY * parallaxStrength * 2}px)`;
			document.querySelector<HTMLDivElement>('.hero-layer4')!.style.transform = `translateY(${scrollY * parallaxStrength * 3}px)`;
			document.querySelector<HTMLDivElement>('.hero-layer5')!.style.transform = `translateY(${scrollY * parallaxStrength * 3}px)`;
			document.querySelector<HTMLDivElement>('.hero-layer6')!.style.transform = `translateY(${scrollY * parallaxStrength * 4}px)`;

			const maxScroll = window.innerHeight;
			const text = document.querySelector<HTMLDivElement>('.parallax-text')!;
			const clampedScroll = Math.min(scrollY, maxScroll);
			text.style.transform = `translateY(${clampedScroll}px)`;

            footstepsUpdate();
            fakeHeaderColor();
		});
    });
</script>

{#snippet title()}
    <span class="self-center whitespace-nowrap text-xl font-semibold invisible">Mykola Morozov</span>
{/snippet}

<AppNavbar
    class="fixed z-10 top-0"
    bgClass="bg-white/50 dark:bg-gray-800/50 dark:text-white"
    bgClassUl="backdrop-blur-md bg-white dark:bg-gray-800 md:bg-white/50 md:dark:bg-gray-800/50 text-black dark:text-white"
    {title}
    fillNarrow={true}
    shouldFixNavbar="true"
/>
<div class="w-full h-[100vh] absolute top-0 left-0">
	<div class="max-w-full max-h-full h-[100vh] relative overflow-hidden">
		<div class="parallax-layer hero-layer1"></div>
		<div class="parallax-layer hero-layer2"></div>
		<div class="parallax-layer hero-layer3"></div>
		<div class="parallax-layer hero-layer4"></div>
		<div class="parallax-layer hero-layer5"></div>
		<div class="parallax-layer hero-layer6"></div>
        <div class="absolute z-10 text-white drop-shadow-xl text-[8rem] left-10 top-[1rem] pointer-events-none parallax-text">Hikes</div>
	</div>
</div>
<div class="h-[100vh] w-full"></div>
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
<svg
        width="auto" height="auto"
        overflow="visible"
        id="footsteps-container"
        xmlns="http://www.w3.org/2000/svg">
</svg>

<section class="container mx-auto mb-8">
    <div class="mx-4 2xl:mx-0 md:px-24 mb-8">
        <Heading tag="h3">Projects</Heading>
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-8">
            <ShowcaseCard x={2} y={1} class="lg:col-span-2" href="/projects/data-viz/hikes/all/" img="/images/hikes/hero/web.png">
                <h5 class="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white pb-4">
                    Hiking Web
                </h5>
                <p class="leading-tight text-justify font-normal text-gray-700 dark:text-gray-400 pb-4">
                    An attempt to connect all visited hiking paths into a single network.
                </p>
                <p class="leading-tight text-justify font-normal text-gray-700 dark:text-gray-400 pb-4">
                    All of the simplified hiking routes on the page are fully explorable,
                    some even contain event descriptions and photos from the hike.
                </p>
                <p class="leading-tight text-justify font-normal text-gray-700 dark:text-gray-400 pb-4">
                    The simplified routes are based on the approximate origins and destinations
                    of the hikes and include intersection points with other simplified routes.
                </p>
                <p class="leading-tight text-justify font-normal text-gray-700 dark:text-gray-400">
                    Currently, most of the South Bavarian hikes have been connected.
                </p>
            </ShowcaseCard>
            <ShowcaseCard x={1} y={1} href="/projects/data-viz/hikes/all/" img="/images/hikes/hero/web.png">
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

<div style="height: 3000px;">
    <h1>Scroll down to see footsteps!</h1>
</div>

<AppFooter />

<style>
	.parallax-layer {
		@apply absolute top-0 left-0 w-full h-full;

		background-repeat: no-repeat;
		background-size: cover;
		background-position: center;
		pointer-events: none;
	}

	.parallax-text {
		transition: transform 0.1s linear;
	}

	.hero-layer1 {
		background-image: url("/images/hikes/hero/hike_poster_4_bg_2.png");
		transform: translateY(0);
		z-index: 1;
	}

	.hero-layer2 {
		background-image: url("/images/hikes/hero/hike_poster_4.png");
		transform: translateY(0);
		z-index: 2;
	}

	.hero-layer3 {
		background-image: url("/images/hikes/hero/hike_poster_3.png");
		transform: translateY(0);
		z-index: 3;
	}

	.hero-layer4 {
		background-image: url("/images/hikes/hero/hike_poster_2.png");
		transform: translateY(0);
		z-index: 4;
	}

	.hero-layer5 {
		background-image: url("/images/hikes/hero/hike_poster_0.png");
		transform: translateY(0);
		z-index: 5;
	}

	.hero-layer6 {
		background-image: url("/images/hikes/hero/hike_poster_1.png");
		transform: translateY(0);
		z-index: 6;
	}

    #footsteps-container {
        position: absolute;
        left: 0;
        top: 0;
        pointer-events: none;
        z-index: -20;
    }

    :global(.footstep) {
        mask-image: url("/images/hikes/hero/footstep.svg");
        -webkit-mask-image: url("/images/hikes/hero/footstep.svg");
        mask-position: center;
        mask-size: 20px 40px;
        fill: black;
    }

    :global(html.dark .footstep) {
        fill: rgb(107 114 128 / var(--tw-text-opacity, 1));
    }
</style>
