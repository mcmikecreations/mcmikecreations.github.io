<script lang="ts">
	import AppFooter from '$lib/components/AppFooter.svelte';
	import AppTitle from '$lib/components/AppTitle.svelte';
	import { A, Heading, Modal, P, Span, Timeline, TimelineItem } from 'flowbite-svelte';
	import resume from '$lib/data/resume.json';
	import SocialBadgeList from '$lib/components/SocialBadgeList.svelte';

	const educationModals = Array<boolean>(resume.education.length);
	const educationEmail = resume.basics.profiles.find(x => x.network === 'TUM')?.url ?? '';
	const workEmail = resume.basics.profiles.find(x => x.network === 'Group107')?.url ?? '';
</script>

<AppTitle title="Résumé" />

<section class="container mx-auto md:px-24">
	<div class="mt-8 mx-4 2xl:mx-0 flex flex-row flex-wrap gap-8">
		<div class="size-60 mx-auto rounded-full
				shadow-[inset_0_0_20px_rgb(0_0_0_/_0.50)]
				bg-[url('/images/profile_cropped.jpg')]
				bg-cover bg-center"
		/>
		<div class="flex-1 flex flex-col gap-2 justify-center">
			<div class="flex flex-row flex-wrap gap-4 mb-4">
				<div>
					<Heading tag="h1" class="text-4xl font-bold mb-2">{resume.basics.name}</Heading>
					<P>{resume.basics.label}</P>
				</div>
				<div class="flex-grow flex flex-wrap gap-4 justify-center sm:justify-end">
					<SocialBadgeList size="child:!size-4 child:xl:!size-6" padding="!p-2 xl:!p-3" />
				</div>
			</div>
			<div class="flex flex-row-reverse flex-wrap justify-end gap-2">
				<div>
					<A href={'mailto:'+resume.basics.email}>{resume.basics.email}</A><br>
					<A href={educationEmail}>{educationEmail.replace('mailto:','')}</A><br>
					<A href={workEmail}>{workEmail.replace('mailto:','')}</A><br>
					<Span>{`${resume.basics.location.city}, ${resume.basics.location.region}, ${resume.basics.location.countryCode}`}</Span>
				</div>
				<P class="flex-1 min-w-60">{resume.basics.summary}</P>
			</div>
		</div>
	</div>
	<div class="flex flex-row flex-wrap gap-8 justify-between mt-8 mx-4 2xl:mx-0">
		<div class="min-w-60 flex-1">
			<Heading tag="h2" class="text-2xl mb-2">Education</Heading>
			<Timeline>
				{#each resume.education as item, i}
					<TimelineItem
						title="{item.studyType} in {item.area}"
						date="{item.startDate} to {item.endDate ?? 'present'}"
						classLi="mb-4"
					>
						{#if item.description}
							<A
								class="mb-4 text-base font-normal text-gray-500 dark:text-gray-400 line-clamp-3"
								on:click={() => educationModals[i] = true}
							>{item.description}</A>
						{/if}
						<P>
							<A href={item.url} class="text-sm">{item.institution}</A>
							<span>·</span>
							<span class="text-sm">{item.location}</span>
						</P>
						<Modal title="{item.studyType} in {item.area}" bind:open={educationModals[i]} autoclose>
							<p class="text-base leading-relaxed text-gray-500 dark:text-gray-400">{item.description}</p>
						</Modal>
					</TimelineItem>
				{/each}
			</Timeline>
		</div>
		<div class="min-w-60 flex-1">
			<Heading tag="h2" class="text-2xl mb-2">Work</Heading>
			<Timeline>
				{#each resume.work as item}
					<TimelineItem
						title="{item.position}"
						date="{item.startDate} to {item.endDate ?? 'present'}"
						classLi="mb-4"
					>
						{#if item.description}
							<P
								class="mb-4 text-base font-normal text-gray-500 dark:text-gray-400 line-clamp-3"
							>{item.description}</P>
						{/if}
						<P>
							<A href={item.url} class="text-sm">{item.name}</A>
							<span>·</span>
							<span class="text-sm">{item.location}</span>
						</P>
					</TimelineItem>
				{/each}
			</Timeline>
		</div>
	</div>
</section>

<AppFooter />
