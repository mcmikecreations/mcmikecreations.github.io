<script lang="ts">
	import AppBreadcrumbs from '$lib/components/AppBreadcrumbs.svelte';
	import AppJsonLd from '$lib/components/AppJsonLd.svelte';
</script>

<AppBreadcrumbs items={[{ name: 'Home', href: '/' }, { name: 'Projects', href: '/projects/' }, { name: 'Data Viz', href: '/projects/data-viz/' }, { name: 'Russian Economy', href: '/projects/data-viz/politics/russian-economy/' }]} />
<AppJsonLd variant="creative-work" name="Russian Economy" url="/projects/data-viz/politics/russian-economy/" />

<p>hello</p>
