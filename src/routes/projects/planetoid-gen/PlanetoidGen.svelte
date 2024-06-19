<script lang="ts">
	/* eslint-disable svelte/no-at-html-tags */
	import resume from '$lib/data/resume.json';
	import Publication from '$lib/components/Publication.svelte';
	import ProjectImage from '$lib/components/ProjectImage.svelte';
	import { GlobeSolid } from 'flowbite-svelte-icons';
	import katex from 'katex';
	import 'katex/dist/katex.min.css';
	import type { PageData } from './$types';
	export let data: PageData;
</script>

{#if data.project.image}
	<div class="sm:float-end">
		<ProjectImage p={data.project} class="size-80 mx-auto" />
	</div>
{/if}
<h2 class="mt-4">
	<span class="inline-flex justify-center items-center">
		{data.project.name}
		{#if data.project.url}<a href={data.project.url} class="ps-2" target="_blank"><GlobeSolid size="xl" class="inline" /></a>{/if}
	</span>
</h2>
<div></div>
<blockquote>
	{@html data.project.quote}
</blockquote>

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

<h3>Architecture</h3>
<p>
	This system builds on the advancements in multiple academic domains, including databases, distributed
	systems, cloud computing, and parallel execution, to allow data processing and content generation algorithms
	to use state-of-the-art hardware and software to a better extent, focusing on performance, flexibility,
	and extensibility of the proposed system.
</p>

<p>
	The system is built as a distributed loosely-coupled set of microservices, supporting both horizontal and vertical
	scaling. The components contain the minimum required set of microservices, dismissing service registries, gateways,
	etc. for performance and simplicity.
</p>

<img class="w-full lg:w-3/4 text-center mx-auto dark:invert" src="/images/projects/planetoid-gen/planetoidgen-transformation.svg" alt="PlanetoidGen data transformation pipeline. The input in the form of geographic, satellite, and news sources is passed to a software agent-based processing pipeline to produce a set of result, which are subsequently stored in content, temporary, and metadata storage." />

<p>
	The abstract components of the system include multiple data sources, a data processing pipeline, and multiple
	storage options. For the practical use case of the system, the generation of 3D models for news coverage, a
	predefined set of sources and sinks is used, outlined in the figure above.
</p>

<p>
	While all components of the system are required to complete the data transformation flow, each component can start
	up independently. A container orchestration system, <code>Kubernetes</code> is chosen to manage the lifetime
	of the components and handle reliability concerns. It also provides automatic scaling, load balancing, and failover.
	The environment is optimized for hosting both on-premises and using cloud providers like
	<code>Microsoft Azure Cloud Computing Services</code> or <code>Amazon Web Services</code>.
</p>

<h3>Components</h3>

<p>
	The concrete components of the system include a simplified web client with pre-generated and pre-loaded data,
	an external API component, a generation job queue, a set of worker instances for software agents, and a set
	of data storage components for data processing results. An additional results queue is used for caching
	intermediate agent results. The software agents are ordered and non-cyclical dependencies between them
	can be introduced.
</p>

<img class="w-full lg:w-full text-center mx-auto dark:invert" src="/images/projects/planetoid-gen/planetoidgen-components.svg" alt="PlanetoidGen components. The system includes several clients, an external API microservice, a temporary queue for results and a job queue for requests, finally file, vector and OSM data storages." />

<p>
	The main API component, which handles generation and data loading requests from the clients and sends generation
	messages to the broker, is developed using an <code>N-layer architecture</code>, following <code>SOLID</code> principles.
	The presentation layer of the API uses <code>gRPC</code> for high-throughput content streaming. To be more specific,
	bidirectional streaming of data processing requests and content streaming responses is used, maintaining a
	connection with the client to route the processed data correctly. The API is stateless and can be horizontally
	scaled to handle more simultaneous clients. A set of <code>REST</code> endpoints is added for potential legacy
	clients.
</p>

<p>
	For central storage of client connection and reporting about successfully processed requests in a distributed
	environment, a results queue is introduced. Its goal is to receive and pass onto clients the event messages
	from software agents about the successful completion of the data transformation pipeline for a specific request.
	The clients then can query generated data immediately upon notice, making this push-pull approach perform
	faster than the typical open-drain one. Alternatively, an additional agent can be implemented to send data
	to the client, but this option is not explored deeper.
</p>

<p>
	To speed up and parallelize the execution flow, a <code>Morsel-driven parallelism</code> approach is used.
	The data processing tasks are divided into small, independent pieces called "morsels" and distributed
	across a pool of worker threads, processes or instances. Each worker is responsible for executing a single
	morsel and communicating the results back to the main thread or process. A job notion is introduced, where
	a job is a processing request from a single client for a specific software agent in the pipeline. The only
	limiting factor to parallelism in the system is the necessity to process jobs of dependent agents first.
</p>

<p>
	To solve this issue, a message broker, <code>Apache Kafka</code>, is used to store scheduled and in-flight
	jobs. A topic-based system was chosen with a topic per each agent. This allows workers to subscribe to
	topics in the order of agent dependency. While other components, mainly storage, are mounted to physical
	disk file systems for external access, the message broker and the API only use private virtual session
	storage, as the job requests aren't sensitive and their loss on errors is neglectable, as new requests
	from the client can be issued after a timeout.
</p>

<p>
	The storage in the system is split between multiple providers on different orchestrated nodes with support
	for further sharding. For metadata storage, due to its relational nature, <code>PostgreSQL</code> was
	chosen. It is used for maintaining the generation process and the pipeline configurations. This includes
	planetoid descriptions with common parameters, zoom mappings, agent lists with settings. The file storage,
	on the other hand, contains partially structured data in the form of files and dependencies, which is
	a good case for NoSQL databases. <code>MongoDB</code> was selected for this task. Because of the 16 MiB
	limit on record sizes, large files have to be broken down into chunks and placed on the <code>GridFS</code>
	database component.
</p>

<p>
	Since agents can introduce data in different shapes, a flexible dynamic relational table schema description
	has been introduced. A service then uses this description to create stored procedures for <code>CRUD</code>
	operations, as well as table management SQL statements. Agents have functions to describe their input and
	output data using the schema description, allowing for easier inter-agent dependency control and validation.
</p>

<p>
	The next tackled slow point of the system is the entity serialization process. Runtime-compiled methods
	relying on <code>Run-time type information</code> (RTTI) are used through bytecode jeneration for the
	<code>Just-In-Time compilation</code> module of <code>.NET Roslyn API</code>.
</p>

<p>
	To support geographic queries retrieving real-world data on buildings and roads, an additional geo-storage
	is needed. <code>Overpass</code> is the provider of choice, providing per-minute updates of data returned
	in a vector format.
</p>

<img class="w-full lg:w-full text-center mx-auto" src="/images/projects/planetoid-gen/planetoidgen-results.png" alt="PlanetoidGen client. A slider can be used to compare the destroyed landscape with the intact one." />

<p>
	There are two clients for the system: a web client relying on pre-fetched pre-generated data and a desktop
	client using real-time data streaming to acquire 3D models and display them. The location of interest
	is picked based on the virtual camera position and normalized to conform to a rectangular point grid
	on a side of a cube wrapping the planetoid. A local cache is introduced to avoid sending duplicate
	requests for existing data. For the use case described in the overview section, a UI was implemented
	to allow before/after comparisons of large-scale landscapes of eastern Ukraine during the full-scale
	russian invation for news coverage and education purposes with a storytelling aspect.
</p>

<p>
	The worker servers are built on the same structural foundation as the main API, following an N-layer
	architecture. The hosting part of the application runs a set of background worker threads, each polling
	the respective job message topics inside the message broker. Multi-level retry policies and transactions
	are used to fulfill <code>ACID</code> properties and achieve better performance. To allow easy access to
	service abstractions, a combination of <code>Dependency Injection</code> and <code>Service Location</code>
	frameworks is used.
</p>

<p>
	One of the most important services exposed to the software agents is the tile metadata repository, since
	it gives agents the ability to update timestamps for processing timeouts. If the agents take too long to
	process a tile without updating the timestamp, the request is considered as failed and a different agent
	instance will try to process it.
</p>

<h3>Technologies</h3>
<p>
	With a distributed pipeline to generate large-scale data, the issue of produced data size needs to be
	tackled. If the server produces too much data for a single request, the performance of the system may
	drop significantly, especially for a client with limited resources. To prevent this, the client should
	be able to select the quality level of produced content, where better quality represents more detailed
	data, and worse - simplified approximations. A discrete solution using <code>Level Of Detail</code> is
	used to create multiple versions of the same models with different quality levels, and use the
	appropriate version based on the viewing distance or the hardware capabilities.
</p>

<img class="w-full lg:w-full text-center dark:invert mx-auto" src="/images/projects/planetoid-gen/planetoidgen-lod.svg" alt="PlanetoidGen LOD system. Each next level of detail contains a lower quality of each model." />

<p>
	Another side effect of using LOD is that it can be mapped to different zoom levels for landscape areas.
	This allows for more optimized processing queries, represented by an index or area midpoint and a zoom.
</p>

<p>
	The system uses three different GIS coordinate models for the generation process.
</p>

<table class="table-fixed">
	<tbody>
		<tr>
			<td><img class="w-full lg:w-full text-center mx-auto dark:invert" src="/images/projects/planetoid-gen/planetoidgen-coordinates-a.svg" alt="PlanetoidGen spherical coordinates. Represented by longitude and latitude." /></td>
			<td><img class="w-full lg:w-full text-center mx-auto dark:invert" src="/images/projects/planetoid-gen/planetoidgen-coordinates-b.svg" alt="PlanetoidGen cubic coordinates. Represented by face index and relative 2D coordinates on the face." /></td>
			<td><img class="w-full lg:w-full text-center mx-auto dark:invert" src="/images/projects/planetoid-gen/planetoidgen-coordinates-c.svg" alt="PlanetoidGen planar coordinates. A discrete version of cubic coordinates with a global index that can be split into the cube face index and tile index on the face." /></td>
		</tr>
	</tbody>
</table>

<p>
	The API receives requests using a modified spherical coordinate system, containing the longitude and
	latitude of the area to process; the LOD is also included to select a subset of software agents used.
	The LOD value is subsequently converted to a zoom value in the API component, making it a traditional
	GIS spherical coordinate system without elevation.
</p>

<p>
	Next, the system needs to find a GIS tile that envelops the requested point. The planetoid is then divided
	into a rectangular grid of areas and indexing them for referencing. The most common <code>Web Mercator
	Projection</code> severely distorts points around north and south pole, projecting the poles at infinity.
	For this reason, an equal-area projection with support for accurate mapping of poles is needed. The
	<code>Quadrilateralized Spherical Cube Earth Projection</code> is chosen for the task, being commonly
	used in databases for indexing geographical areas. Moreover, the distortion factor is lower than for
	competitors. The projection involves projecting the ellipsoid of the planetoid onto six sides of a cube
	with subsequent distortion correction. The coordinate range of the pair {@html katex.renderToString('(x,y)')}
	on each cube face is mapped to {@html katex.renderToString('[0;1]')}.
</p>

<p>
	For storage indexing purposes, an index pair {@html katex.renderToString('(i,j)')} is used instead. Together
	with a zoom value, it represents the planar coordinate model. While conversion between spherical and cubic
	models is covered by the standard WGS1984 to QSC projection routines, the conversion to the planar model
	is hand-crafted as:
	{@html katex.renderToString('\\begin{matrix*}[l] i &= x * 2^{zoom} \\\\ j &= y * 2^{zoom} * 6 + i_{face} \\end{matrix*}', { displayMode: true, })}
	which with 64-bit integers supports up to zoom 61, giving <u>sub-meter accuracy for Earth-sized planetoids</u>.
	On the other hand, it should be noted that even the conversion between cubic and spherical coordinates
	is lossy in nature, so in general these operations should be performed as infrequently as possible.
</p>

<p>
	The coordinate models are agnostic to the underlying ellipsoid properties, but for correct data processing
	and relative 3D object placement on the client, the system needs to support converting between these
	coordinates and common ones understood by external systems, like meters. To achieve this, a projection
	mapping service is used, generating projection strings in <code>WKT</code> and <code>Proj</code> formats.
	Since different planetoids require separate projection strings due to their ellipsoid properties, the
	strings are placed in the spatial reference system table in the metadata storage. This table can later
	be fed to external relational GIS data consumers for coordinate conversion procedures.
</p>

<p>
	The foundation for the extensible software agent component is the common software agent interface. The
	construction, initialization, and execution is split into different methods of this interface, providing
	flexibility in managing its lifetime. As a result, the agents can be loaded based on a system configuration
	value using dynamic .NET assembly loading and invocation.
</p>

<img class="w-full lg:w-1/2 text-center dark:invert mx-auto" src="/images/projects/planetoid-gen/planetoidgen-dependencies.svg" alt="PlanetoidGen agent dependencies. Each agent can specify dependencies on adjacent tiles, increasing the number of jobs per request." />

<p>
	Each agent has a set of strongly-typed settings values to control the algorithm behavior. Moreover, the
	agent specifies input and output data as well as a list of adjacent tiles that need to provide the input
	data. The information about inputs and outputs can be specified per zoom or in general. These records
	from consequent agents can then be combined into agent dependency chains. Since direct connections are
	not required, a dependency graph is formed. Moreover, agents can depend on data from adjacent areas,
	leading to a growing number of total jobs per request.
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
				Visualization," Technical University of Munich, Apr 2023, <a href="https://drive.google.com/file/d/1_QoeKJpyGxzfxdMzixxRmCCXuagzPTad/view?usp=sharing" target="_blank">[mirror]</a>.</li>
			<li>Roman Moravskyi, "Use of software agents in a distributed system for planetoid
				landscapes generation," Lviv Polytechnic National University, Jun 2023.</li>
			<li>Pavlo Pustelnyk, "Model of server architecture and spatial relational database
				for planetoid landscapes generation," Lviv Polytechnic National University, Jun 2023.</li>
		</ol>
	</li>
	<li><Publication useComponent={false} pub={resume.publications.find(x => x.releaseDate === '2023-01-02')} /></li>
</ol>
