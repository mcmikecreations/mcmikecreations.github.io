<script lang="ts">
	import { page } from '$app/state';

	export interface BreadcrumbItem {
		name: string;
		href?: string;
	}

	interface Props {
		items: BreadcrumbItem[];
	}

	let { items }: Props = $props();

	function absUrl(path: string): string {
		return path.startsWith('http') ? path : page.url.origin + path;
	}

	const schema = $derived({
		'@context': 'https://schema.org',
		'@type': 'BreadcrumbList',
		itemListElement: items.map((item, i) => ({
			'@type': 'ListItem',
			position: i + 1,
			name: item.name,
			...(item.href ? { item: absUrl(item.href) } : {})
		}))
	});
</script>

<svelte:head>
	{@html `<script type="application/ld+json">${JSON.stringify(schema)}</script>`}
</svelte:head>
