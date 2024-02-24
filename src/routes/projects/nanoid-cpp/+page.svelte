<script>
	import resume from '$lib/data/resume.json';
	import AppTitle from '$lib/components/AppTitle.svelte';

	const project = resume.projects.find(x => x.name === 'Nanoid C++');
</script>

<AppTitle title={project?.name} />
