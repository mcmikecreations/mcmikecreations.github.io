<script lang="ts">
	import {onMount} from "svelte";

	let parallaxStrength = $state(0.05);

	onMount(() => {
		window.addEventListener('scroll', () => {
			const scrollY = window.scrollY;
			document.querySelector<HTMLDivElement>('.hero-layer2')!.style.transform = `translateY(${scrollY * parallaxStrength}px)`;
			document.querySelector<HTMLDivElement>('.hero-layer3')!.style.transform = `translateY(${scrollY * parallaxStrength * 2}px)`;
			document.querySelector<HTMLDivElement>('.hero-layer4')!.style.transform = `translateY(${scrollY * parallaxStrength * 3}px)`;
			document.querySelector<HTMLDivElement>('.hero-layer5')!.style.transform = `translateY(${scrollY * parallaxStrength * 3}px)`;
			document.querySelector<HTMLDivElement>('.hero-layer6')!.style.transform = `translateY(${scrollY * parallaxStrength * 4}px)`;

			const container = document.querySelector<HTMLDivElement>('.parallax-container')!;
			const maxScroll = container.offsetHeight - window.innerHeight;
			const text = document.querySelector<HTMLDivElement>('.parallax-text')!;
			const clampedScroll = Math.min(scrollY, maxScroll);
			text.style.transform = `translateY(${clampedScroll}px)`;
		});
	});
</script>

<div class="w-full h-[100vh]">
	<div class="max-w-full max-h-full h-[100vh] relative overflow-hidden bg-red-500 parallax-container">
		<div class="parallax-layer hero-layer1"></div>
		<div class="parallax-layer hero-layer2"></div>
		<div class="parallax-layer hero-layer3"></div>
		<div class="parallax-layer hero-layer4"></div>
		<div class="parallax-layer hero-layer5"></div>
		<div class="parallax-layer hero-layer6"></div>
		<div class="absolute z-10 text-white drop-shadow-xl text-[8rem] left-10 top-0 parallax-text">Hikes</div>
	</div>
	<div class="h-[100vh] w-full bg-green-500">

	</div>
</div>

<style>
	.parallax-layer {
		@apply absolute top-0 left-0 w-full h-full;

		background-repeat: no-repeat;
		background-size: cover;
		background-position: center;
		pointer-events: none;
	}

	.parallax-text {
		pointer-events: none;
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
</style>
