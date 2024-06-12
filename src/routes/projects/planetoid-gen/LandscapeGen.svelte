<script lang="ts">
	import resume from '$lib/data/resume.json';
	import Publication from '$lib/components/Publication.svelte';
</script>

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
	<code>Containerized entities</code>. The containerization is achieved using
	<code>Hierarchical axis-aligned bounding volumes</code>.
</p>

<h3>System architecture</h3>

<p>
	As mentioned in the overview, the overall systems consists of a simple client and a three-layer server.
	On the other hand, the server can be divided into a few distinct components, communicating with each other upon
	receiving each request.
</p>

<img class="w-full lg:w-1/2 text-center mx-auto dark:invert" src="/images/projects/planetoid-gen/landscapegen-communication.svg" alt="LandscapeGen component communication diagram. Agents are retrieved from the agent registry and applied in the worker. Produced data is containerized, cached, and sent to the client." />

<p>
	Mainly, the server consists of an agent registry, a cache, and a worker service. When a new request appears,
	the following procedure is executed:
</p>
<ol>
	<li>The request to generate a landscape area (chunk) is passed to the worker.</li>
	<li>The worker collects a list of agents necessary to fulfill this request, then queries the agent registry for the concrete agent implementations.</li>
	<li>The worker applies the agents to the chunk object in the correct order based on their dependencies.</li>
	<li>The chunk object is containerized and stored in cache, then returned to the client.</li>
</ol>

<img class="w-full lg:w-1/2 text-center mx-auto invert dark:invert-0" src="/images/projects/planetoid-gen/landscapegen-terrain.png" alt="LandscapeGen terrain generation. All components produced by the agents, including terrain, are contained within a certain chunk." />

<p>
	The division of the overall landscape into chunks works as a simple axis-aligned grid division, e.g. into
	128-meter segments. Each chunk object contains a list of entities produced by the agents, including terrain,
	cities, roads, districts, buildings, and trees.
</p>

<img class="w-full lg:w-1/2 text-center mx-auto dark:invert" src="/images/projects/planetoid-gen/landscapegen-containerization.png" alt="LandscapeGen containerization. Objects are hierarchically divided using axis-aligned bounding volumes." />

<p>
	The resulting structure is containerized using hierarchical axis-aligned bounding volumes, which is also
	used for occlusion checking during rendering. Bounding volumes are produced during generation, but no further
	agent-specific optimizations are performed within the scope of the developed prototype. The incuded agents are:
</p>

<ol>
	<li>Terrain generation agent using <code>Bezier surfaces</code>. The heightmap is produced using <code>Perlin noise</code>.</li>
	<li>City generation, selecting several potential points within a region of 9x9 chunks using <code>Alea random</code> and <code>MurmurHash3</code>.</li>
	<li>Road generation within cities using <code>ARC4 random</code>. Manhattan-style roads in the image.</li>
	<li>Road generation between cities. <code>Bezier curve</code> roads in the image.</li>
	<li>Intersection generation between road segment pairs.</li>
	<li>District bounds generation using <code>Delaunay triangulation</code>.</li>
	<li>Architecture generation using <code>Boolean operations</code>.</li>
	<li>Decoration generation, including roofs, on architecture, using <code>Mesh extrusion</code>.</li>
	<li>Vegetation generation around buildings in certain districts using <code>Random scatter</code>.</li>
</ol>

<img class="w-full lg:w-1/2 text-center mx-auto dark:invert" src="/images/projects/planetoid-gen/landscapegen-agents.png" alt="LandscapeGen anthropogenic object generation. City origin points are generated first, roads around them, roads connecting cities, intersections, districts, buildings, parks, and trees." />

<p>
	The generation metadata is stored during the generation process and afterwards in the cache,
	so repeated or additional subsequent generation is faster.
</p>

<img class="w-full lg:w-1/2 text-center mx-auto" src="/images/projects/planetoid-gen/landscapegen-example.png" alt="LandscapeGen simplified generation results." />

<p>
	The resulting solution can be used as training data for <code>Machine Learning</code>,
	for visualizations, simulations, and for interactive experiences.
</p>

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
