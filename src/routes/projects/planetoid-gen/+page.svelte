<script lang="ts">
	/* eslint-disable svelte/no-at-html-tags */
	import type { PageData } from './$types';
	import AppTitle from '$lib/components/AppTitle.svelte';
	import { GlobeSolid } from 'flowbite-svelte-icons';
	import ProjectImage from '$lib/components/ProjectImage.svelte';

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
				{data.project.name}
				{#if data.project.url}<a href={data.project.url} class="ps-2" target="_blank"><GlobeSolid size="xl" class="inline" /></a>{/if}
			</span>
		</h2>
		<blockquote>{@html data.project.quote}</blockquote>
		<h3>Overview</h3>
		<p>
			{@html data.project.description}
		</p>
		<p>
			This project is part of a larger body of research I conducted together with
			Roman Moravskyi<sup>1</sup>, Pavlo Pustelnyk<sup>1</sup>, Yevheniia Levus<sup>1</sup>,
			Rüdiger Westermann<sup>2</sup>, and Asanobu Kitamoto<sup>3</sup>.<br>
			<sup>1</sup> <a href="https://lpnu.ua/" target="_blank">Lviv Polytechnic National University</a>, Lviv, Ukraine.<br>
			<sup>2</sup> <a href="https://www.tum.de/" target="_blank">Technical University of Munich</a>, Munich, Germany.<br>
			<sup>3</sup> <a href="https://www.nii.ac.jp/" target="_blank">National Institute of Informatics</a>, Tokyo, Japan.
		</p>
		<h3>Publications</h3>
		<ol>
			<li>
				Master's Thesis:
				<ol type="a">
					<li>Mykola Morozov, An Extensible System for Large Scale Cultural Heritage Data Visualization</li>
					<li>Roman Moravskyi, Use of software agents in a distributed system for planetoid landscapes generation</li>
					<li>Pavlo Pustelnyk, Model of server architecture and spatial relational database
						for planetoid landscapes generation</li>
				</ol>
			</li>
		</ol>
		<h2>LandscapeGen</h2>
		<h3>Publications</h3>
		<ol>
			<li>
				Bachelor's Thesis, Software system for visualization of natural and anthropogenic landscapes:
				<ol type="a">
					<li>Mykola Morozov, Generation of three-dimensional objects of architecture and infrastructure taking into account the characteristics of the landscape</li>
					<li>Roman Moravskyi, Landscape generation using Bezier curves and surfaces</li>
					<li>Pavlo Pustelnyk, Containerization of three-dimensional scenes with different levels of detail</li>
				</ol>
			</li>
		</ol>
	</article>
</main>
