<script lang="ts">
	/* eslint-disable svelte/no-at-html-tags */
	import resume from '$lib/data/resume.json';
	import Publication from '$lib/components/Publication.svelte';
	import ProjectImage from '$lib/components/ProjectImage.svelte';
	import { GlobeSolid } from 'flowbite-svelte-icons';
	import type { PageData } from './$types';
	export let data: PageData;
</script>

{#if data.project.image}
	<div class="sm:float-end me-4">
		<ProjectImage p={data.project} class="size-80 mx-auto" />
	</div>
{/if}
<h2>
			<span class="inline-flex justify-center items-center">
				{data.project.name}
				{#if data.project.url}<a href={data.project.url} class="ps-2" target="_blank"><GlobeSolid size="xl" class="inline" /></a>{/if}
			</span>
</h2>
<blockquote>
	{@html data.project.quote}</blockquote>

<p>
	This page is divided into two parts. The first part covers PlanetoidGen, briefly described above.
	The second part covers LandscapeGen, a predecessor of the PlanetoidGen system, developed several years prior.
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
