<script lang="ts">
	/* eslint-disable svelte/no-at-html-tags */
	import { A, Badge, Card, Heading, Hr, Img, Span } from 'flowbite-svelte';
	import blogs from '$lib/data/blogs.json';
	import { ImageSolid } from 'flowbite-svelte-icons';
	import DateBadge from '$lib/components/DateBadge.svelte';

	const posts = blogs.slice(0, 3);
	const hasPosts = blogs.length > 0;
</script>

{#if hasPosts}
	<section id="blog">
		<Heading tag="h2" class="text-center mt-8">Latest <A href="/blog">Blog</A> Posts</Heading>
		<div class="flex flex-wrap justify-center gap-4 mt-8 mx-4 2xl:mx-0">
			{#each posts as p}
				{@const date = new Date(p.date)}
				{@const u = '/blog/' + p.path.substring(0, p.path.length - 3)}
				<Card
					href={u}
					img={p.image ?? undefined}
					class="flex-1"
				>
					<Heading tag="h3">{p.title}</Heading>
					<Span class="pt-4 flex-grow">{@html p.description}</Span>
					<div class="pt-4 w-full flex flex-row">
						<DateBadge date={date} dateEnd={undefined} />
						<div class="flex-grow flex flex-row justify-end gap-2 ps-2">
							{#each p.tags as t}
								<Badge>{t}</Badge>
							{/each}
						</div>
					</div>
				</Card>
			{/each}
		</div>
	</section>
{/if}