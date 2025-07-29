<script lang="ts">
	import { A, Blockquote, Heading, Modal, P, Timeline, TimelineItem } from 'flowbite-svelte';
	import resume from '$lib/data/resume.json';

	const educationModals = $state(Array<boolean>(resume.education.length).fill(false));
	const workModals = $state(Array<boolean>(resume.work.length).fill(false));
</script>

<div class="flex flex-row flex-wrap gap-8 justify-between mt-8 mx-4 2xl:mx-0">
	<div class="min-w-60 flex-1">
		<Heading tag="h2" class="text-2xl mb-2">Education</Heading>
		<Timeline>
			{#each resume.education as item, i}
				<TimelineItem
					title="{item.studyType} in {item.area}"
					date="{item.startDate} to {item.endDate ?? 'present'}"
					class="mb-4"
				>
					{#if item.description}
						<A
							class="mb-4 text-base font-normal text-gray-500 dark:text-gray-400 line-clamp-3"
							onclick={() => (educationModals[i] = true)}
						>{item.description}</A>
					{/if}
					<P>
						<A href={item.url} target="_blank" class="text-sm">{item.institution}</A>
						<span>·</span>
						<span class="text-sm">{item.location}</span>
					</P>
					<Modal
							class="m-4 w-[calc(100%-2rem)] left-[calc(50%-1rem)]"
							title="{item.studyType} in {item.area}"
							bind:open={educationModals[i]}
							autoclose>
						<p class="text-base leading-relaxed text-gray-500 dark:text-gray-400">{item.description}</p>
					</Modal>
				</TimelineItem>
			{/each}
		</Timeline>
	</div>
	<div class="min-w-60 flex-1">
		<Heading tag="h2" class="text-2xl mb-2">Work</Heading>
		<Timeline>
			{#each resume.work as item, i}
				<TimelineItem
					title={item.position}
					date="{item.startDate} to {item.endDate ?? 'present'}"
					class="mb-4"
				>
					{#if item.description}
						<A
							class="mb-4 text-base font-normal text-gray-500 dark:text-gray-400 line-clamp-3"
							onclick={() => (workModals[i] = true)}
						>{item.description}</A>
					{/if}
					<P>
						<A href={item.url} target="_blank" class="text-sm">{item.name}</A>
						<span>·</span>
						<span class="text-sm">{item.location}</span>
					</P>
					<Modal
							class="m-4 w-[calc(100%-2rem)] left-[calc(50%-1rem)]"
							title={item.position}
							bind:open={workModals[i]}
							autoclose>
						<Blockquote class="text-base leading-relaxed text-gray-500 dark:text-gray-400">{item.summary}.</Blockquote>
						<p class="text-base leading-relaxed text-gray-500 dark:text-gray-400">{item.description}</p>
						<p class="text-base leading-relaxed text-gray-500 dark:text-gray-400">{item.highlights.join(' · ')}</p>
					</Modal>
				</TimelineItem>
			{/each}
		</Timeline>
	</div>
</div>
