<script lang="ts">
	/* eslint-disable svelte/no-at-html-tags */
	import { A, Badge, Heading, Hr, Img, Span } from 'flowbite-svelte';
	import blogs from '$lib/data/blogs.json';
	import { CalendarMonthSolid, ImageSolid } from 'flowbite-svelte-icons';

	const posts = blogs.slice(0, 3);
	const hasPosts = blogs.length > 0;
</script>

{#if hasPosts}
	<section class="container mx-auto">
		<Heading tag="h2" class="text-center mt-8">Latest <A href="/blog">Blog</A> Posts</Heading>
		<div class="grid grid-cols-[repeat(auto-fit,_minmax(20rem,_1fr))] grid-flow-row gap-4 mt-8 mx-4 2xl:mx-0">
			{#each posts as p}
				{@const d = new Date(p.date)}
				{@const u = '/blog/' + p.path.substring(0, p.path.length - 3)}
				<a
					class="flex flex-col w-full rounded-lg shadow-lg bg-white dark:bg-gray-800"
					href={u}
				>
					<div class="relative w-full aspect-crt">
						<div class="w-full aspect-crt flex justify-center items-center">
							<ImageSolid class="w-16 h-16 text-gray-500 dark:text-gray-500" />
						</div>
						<Hr classHr="my-0" />
						{#if p.image}
							<div class="absolute top-0 left-0 bottom-0 right-0">
								<Img src={p.image ?? undefined} class="w-full h-full aspect-crt rounded-t-lg object-cover object-center" />
							</div>
						{/if}
					</div>
					<div class="flex-grow flex flex-col p-4">
						<Heading tag="h3">{p.title}</Heading>
						<Span class="flex-grow pt-4">{@html p.description}</Span>
						<div class="pt-4 w-full flex flex-row">
							<CalendarMonthSolid class="self-center w-4 h-4 text-gray-900 dark:text-white" />
							<Span class="align-middle">{`${d.getFullYear().toString().padStart(4,'0')}/${(d.getMonth() + 1).toString().padStart(2,'0')}/${d.getDate().toString().padStart(2,'0')}`}</Span>
							<div class="flex-grow flex flex-row justify-end gap-2">
								{#each p.tags as t}
									<Badge>{t}</Badge>
								{/each}
							</div>
						</div>
					</div>
				</a>
			{/each}
		</div>
	</section>
{/if}