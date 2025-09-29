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

        const footstepsContainer = document.getElementById('footsteps-container');
        function footstepsUpdate() {
            const stepDistanceY = 60;
            const stepDistanceX = 30;
            const scrollY = window.scrollY;

            if (!footstepsContainer) return;
            const stepCount = Math.floor(scrollY / stepDistanceY);
            const oldStepCount = footstepsContainer.children.length / 2;

            const stepOffsetY = window.innerHeight * ((stepCount * stepDistanceY + window.innerHeight) / document.documentElement.scrollHeight);
            const stepOffsetX = 50;

            if (oldStepCount > stepCount) {
                for (let i = stepCount; i < oldStepCount; ++i) {
                    footstepsContainer.removeChild(footstepsContainer.lastChild!);
                }
            } else if (oldStepCount < stepCount) {
                for (let i = oldStepCount; i < stepCount; ++i) {
                    const svgNS = footstepsContainer.getAttribute('xmlns');
                    {
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
                    {
                        const footstep = document.createElementNS(svgNS, 'rect') as SVGRectElement;

                        // Curve formula (e.g., sine wave)
                        const t = i + 0.5;
                        const x = stepDistanceX * Math.sin(t);
                        const y = t * stepDistanceY; // vertical position
                        footstep.setAttribute('x', '0');
                        footstep.setAttribute('y', '0');
                        footstep.setAttribute('width', '20');
                        footstep.setAttribute('height', '40');
                        let transform = '';
                        const angle = Math.atan(-Math.cos(t) * stepDistanceX / stepDistanceY);
                        const offsetDistance = 0;
                        transform += ` translate(${x + stepOffsetX - offsetDistance * Math.sin(angle)} ${y + stepOffsetY + offsetDistance * Math.cos(angle)})`;
                        transform += `scale(1 1)`;
                        transform += ` rotate(${180 + angle / Math.PI * 180} 10 20)`;
                        footstep.setAttribute('transform', transform);
                        footstep.setAttribute('class', 'footstep');

                        footstepsContainer.appendChild(footstep);
                    }
                }
            }
        }

        window.addEventListener('scroll', footstepsUpdate);
        footstepsUpdate();
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
    <!-- TODO: light/dark button -->
</div>
<div class="h-[100vh] w-full bg-green-500">

</div>
<svg
        width="auto" height="auto"
        overflow="visible"
        id="footsteps-container"
        xmlns="http://www.w3.org/2000/svg">
</svg>
<div></div>
<div style="height: 3000px;">
    <h1>Scroll down to see footsteps!</h1>
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

    #footsteps-container {
        position: absolute;
        left: 0;
        top: 0;
        pointer-events: none;
    }

    :global(.footstep) {
        mask-image: url("/images/hikes/hero/footstep.svg");
        -webkit-mask-image: url("/images/hikes/hero/footstep.svg");
        mask-position: center;
        mask-size: 20px 40px;
        fill: black;
    }

    :global(html.dark .footstep) {
        fill: white;
    }
</style>
