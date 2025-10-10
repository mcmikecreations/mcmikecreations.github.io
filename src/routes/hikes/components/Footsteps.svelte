<script lang="ts">
	import { onMount } from 'svelte';
	import { animate, eases, onScroll, stagger } from 'animejs';

	onMount(() => {
		const footstepsContainer = document.getElementById('footsteps-container');
		const stepDistanceY = 60;
		const stepDistanceX = 30;
		function footstepsUpdate() {
			const scrollY = document.documentElement.scrollHeight; //window.scrollY;

			if (!footstepsContainer) return;
			const stepCount = Math.max(Math.floor(scrollY / stepDistanceY), 0);
			const oldStepCount = footstepsContainer.children.length;

			const stepOffsetY = window.innerHeight * 0.5; //window.innerHeight * ((stepCount * stepDistanceY) / (document.documentElement.scrollHeight));
			const stepOffsetX = stepDistanceX;

			if (oldStepCount > stepCount) {
				for (let i = stepCount; i < oldStepCount; ++i) {
					footstepsContainer.removeChild(footstepsContainer.lastChild!);
				}
			} else if (oldStepCount < stepCount) {
				for (let i = oldStepCount; i < stepCount; ++i) {
					const svgNS = footstepsContainer.getAttribute('xmlns');
					const footstep = document.createElementNS(svgNS, 'rect') as SVGRectElement;

					// Curve formula (e.g., sine wave)
					const t = i;
					const x = stepDistanceX * Math.sin(t);
					const y = t * stepDistanceY; // vertical position
					footstep.setAttribute('x', (x + stepOffsetX).toString());
					footstep.setAttribute('y', (y + stepOffsetY).toString());
					footstep.setAttribute('width', '20');
					footstep.setAttribute('height', '40');
					let transform = '';
					const angle = Math.atan(-Math.cos(t) * stepDistanceX / stepDistanceY);
					//transform += ` translate(0 0)`;

					if (i % 2 === 0) {
						transform += ` translate(${(x + stepOffsetX) * 2} 0)`;
						transform += ` rotate(${180 + angle / Math.PI * 180} ${-1 * (x + stepOffsetX) + 10} ${y + stepOffsetY + 20})`;
						transform += ` scale(-1 1)`;
					}
					else {
						transform += ` scale(1 1)`;
						transform += ` rotate(${180 + angle / Math.PI * 180} ${x + stepOffsetX + 10} ${y + stepOffsetY + 20})`;
					}

					footstep.setAttribute('transform', transform);
					footstep.classList.add('footstep');
					footstepsContainer.appendChild(footstep);
				}
			}
		}
		footstepsUpdate();
		const footsteps = footstepsContainer!.children;
		for (const f of footsteps) {
			animate(f, {
				opacity: [0, 1, 0],
				duration: 700,
				delay: stagger(140), // controls spacing along the trail
				ease: eases.outBack(),
				autoplay: onScroll({
					enter: 'center',
					leave: `center-=${stepDistanceY * 3}px`,
					sync: 0.75,
				}),
			});
		}
	});
</script>

<svg
	width="auto" height="auto"
	style="position: absolute; top: 0; height: 100%; z-index: 0; pointer-events: none;"
	class="-mt-32 md:mt-0"
	opacity="0.5"
	overflow="visible"
	id="footsteps-container"
	xmlns="http://www.w3.org/2000/svg">
</svg>

<style>
    :global(.footstep) {
        mask-image: url("/images/hikes/hero/footstep.svg");
        -webkit-mask-image: url("/images/hikes/hero/footstep.svg");
        mask-position: center;
        mask-size: 20px 40px;
        fill: black;
    }

    :global(html.dark .footstep) {
        /*fill: rgb(107 114 128 / var(--tw-text-opacity, 1));*/
        fill: white;
    }
</style>
