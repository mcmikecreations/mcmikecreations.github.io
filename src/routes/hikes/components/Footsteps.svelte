<script lang="ts">
	import { onMount } from 'svelte';

	onMount(() => {
		const footstepsContainer = document.getElementById('footsteps-container');
		function footstepsUpdate() {
			const stepDistanceY = 60;
			const stepDistanceX = 30;
			const scrollY = window.scrollY;

			if (!footstepsContainer) return;
			const stepCount = Math.max(Math.floor(scrollY / stepDistanceY), 0);
			const oldStepCount = footstepsContainer.children.length;

			const stepOffsetY = window.innerHeight * 0.5; //window.innerHeight * ((stepCount * stepDistanceY) / (document.documentElement.scrollHeight));
			const stepOffsetX = 50;

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
					footstep.setAttribute('x', '0');
					footstep.setAttribute('y', '0');
					footstep.setAttribute('width', '20');
					footstep.setAttribute('height', '40');
					let transform = '';
					const angle = Math.atan(-Math.cos(t) * stepDistanceX / stepDistanceY);
					transform += ` translate(${x + stepOffsetX} ${y + stepOffsetY})`;

					if (i % 2 === 0) {
						transform += ` rotate(${180 + angle / Math.PI * 180} 10 20)`;
						transform += `scale(-1 1)`;
					}
					else {
						transform += `scale(1 1)`;
						transform += ` rotate(${180 + angle / Math.PI * 180} 10 20)`;
					}

					footstep.setAttribute('transform', transform);
					footstep.setAttribute('class', 'footstep');
					footstepsContainer.appendChild(footstep);
				}
			}
		}
		footstepsUpdate();

		window.addEventListener('resize', () => {
			if (footstepsContainer) {
				footstepsContainer.innerHTML = '';
				footstepsUpdate();
			}
		});

		window.addEventListener('scroll', () => {
			footstepsUpdate();
		});
	});
</script>

<svg
	width="auto" height="auto"
	style="position: absolute; top: 0; z-index: 0; pointer-events: none;"
	class="-ml-16 md:ml-0 -mt-32 md:mt-0"
	opacity="0.5"
	overflow="visible"
	id="footsteps-container"
	xmlns="http://www.w3.org/2000/svg">
</svg>
