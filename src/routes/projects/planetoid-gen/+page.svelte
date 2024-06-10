<script lang="ts">
	/* eslint-disable svelte/no-at-html-tags */
	import type { PageData } from './$types';
	import AppTitle from '$lib/components/AppTitle.svelte';
	import { GlobeSolid } from 'flowbite-svelte-icons';
	import ProjectImage from '$lib/components/ProjectImage.svelte';
	import resume from '$lib/data/resume.json';
	import Publication from '$lib/components/Publication.svelte';
	import ToTopButton from '$lib/components/ToTopButton.svelte';

	export let data: PageData;
</script>

<AppTitle title={data.project.name} />

<main class="mx-4 2xl:mx-0 mb-8 md:px-24">
	<article class="flex-grow prose dark:prose-invert prose-a:text-primary-600 dark:prose-a:text-primary-500 md:prose-lg lg:prose-xl min-h-80 max-w-none">
		{#if data.project.image}
			<div class="sm:float-end me-4">
				<ProjectImage p={data.project} class="size-80 mx-auto" />
			</div>
		{/if}
		<h2>
			<span class="inline-flex justify-center items-center">
				{data.project.name}©
				{#if data.project.url}<a href={data.project.url} class="ps-2" target="_blank"><GlobeSolid size="xl" class="inline" /></a>{/if}
			</span>
		</h2>
		<blockquote>{@html data.project.quote}</blockquote>

		<p>
			This page is divided into two parts. The first part covers PlanetoidGen©, briefly described above.
			The second part covers LandscapeGen©, a predecessor of the PlanetoidGen© system, developed several years prior.
			A list of relevant publications can be found at the end of each part.
		</p>
		<p>
			This project is part of a larger body of research I conducted together with
			Roman Moravskyi<sup>1</sup>, Pavlo Pustelnyk<sup>1</sup>, Yevheniia Levus<sup>1</sup>,
			Rüdiger Westermann<sup>2</sup>, and Asanobu Kitamoto<sup>3</sup>.<br>
			<sup>1</sup> <a href="https://lpnu.ua/" target="_blank">Lviv Polytechnic National University</a>, Lviv, Ukraine.<br>
			<sup>2</sup> <a href="https://www.tum.de/" target="_blank">Technical University of Munich</a>, Munich, Germany.<br>
			<sup>3</sup> <a href="https://www.nii.ac.jp/" target="_blank">National Institute of Informatics</a>, Tokyo, Japan.
		</p>

		<h3>Overview</h3>
		<p>
			{@html data.project.description}
		</p>

		<h3>Publications</h3>
		<ol>
			<li><Publication useComponent={false} pub={resume.publications.find(x => x.releaseDate === '2023-11-27')} /></li>
			<li><Publication useComponent={false} pub={resume.publications.find(x => x.releaseDate === '2023-09-20')} /></li>
			<li><Publication useComponent={false} pub={resume.publications.find(x => x.releaseDate === '2023-05-02')} /></li>
			<li>
				Master's Thesis:
				<ol type="a">
					<li>Mykola Morozov, "An Extensible System for Large Scale Cultural Heritage Data
						Visualization," Technical University of Munich, Apr 2023</li>
					<li>Roman Moravskyi, "Use of software agents in a distributed system for planetoid
						landscapes generation," Lviv Polytechnic National University, Jun 2023</li>
					<li>Pavlo Pustelnyk, "Model of server architecture and spatial relational database
						for planetoid landscapes generation," Lviv Polytechnic National University, Jun 2023</li>
				</ol>
			</li>
			<li><Publication useComponent={false} pub={resume.publications.find(x => x.releaseDate === '2023-01-02')} /></li>
		</ol>

		<h2>LandscapeGen</h2>
		<blockquote>
			A full-stack visualization system of natural and anthropogenic landscapes,
			including terrain, infrastructure and architecture.
		</blockquote>

		<h3>Overview</h3>
		<p>
			The tool has been implemented as a session-based <code>Node.js</code> server component of a client-server
			application for easy integration with existing software systems. A simple <code>JavaScript</code> web client
			was also created for testing purposes. <code>Software Agents</code> are used instead of traditional parallel
			algorithms and plugins to unify the API and improve performance. The server consists of 3 layers:
			a <code>REST</code>-based service layer, the business logic layer with the agent registry, and the
			data processing layer with permanent <code>Data storage</code> and a <code>System cache</code> for results.
			The natural landscape agents utilize <code>Bezier curves and surfaces</code> for terrain and water bodies.
			Produced anthropogenic data has <code>LOD</code> support, being stored and transferred as
			<code>Containerized hierarchical entities</code>.
		</p>

		<h3>System architecture</h3>

		<img class="w-full lg:w-1/2 text-center mx-auto dark:invert" src="/images/projects/planetoid-gen/landscapegen-communication.svg" alt="LandscapeGen component communication diagram. Agents are retrieved from the agent registry and applied in the worker. Produced data is containerized, cached, and sent to the client." />

		<h3>Publications</h3>
		<ol>
			<li><Publication useComponent={false} pub={resume.publications.find(x => x.releaseDate === '2022-07-01')} /></li>
			<li><Publication useComponent={false} pub={resume.publications.find(x => x.releaseDate === '2021-11-25')} /></li>
			<li>
				Bachelor's Thesis, Software system for visualization of natural and anthropogenic landscapes:
				<ol type="a">
					<li>Mykola Morozov, "Generation of three-dimensional objects of architecture and
						infrastructure taking into account the characteristics of the landscape,"
						Lviv Polytechnic National University, Jun 2021, <a href="https://drive.google.com/file/d/1DjTEg8RJf-UshIzodUHKXz1cIe0Z_O7O/view?usp=sharing" target="_blank">[mirror]</a>.</li>
					<li>Roman Moravskyi, "Landscape generation using Bezier curves and surfaces,"
						Lviv Polytechnic National University, Jun 2021, <a href="https://drive.google.com/file/d/1Aw4Ssfd4ur5Q2Ukm3ww2pdJBrkYpR8O4/view?usp=sharing" target="_blank">[mirror]</a>.</li>
					<li>Pavlo Pustelnyk, "Containerization of three-dimensional scenes with different
						levels of detail," Lviv Polytechnic National University, Jun 2021, <a href="https://drive.google.com/file/d/1wc5yIFLdXOoZJPfyuUXOj1K3_jMVOrfV/view?usp=sharing" target="_blank">[mirror]</a>.</li>
				</ol>
			</li>
			<li><Publication useComponent={false} pub={resume.publications.find(x => x.releaseDate === '2020-02-27')} /></li>
		</ol>
	</article>
</main>

<ToTopButton />
