<script lang="ts">
	import type { PageData } from './$types';
	import SvelteMarkdown from 'svelte-markdown';
	import { Hr, A } from 'flowbite-svelte';
	import {
		CustomParagraph,
		CustomBlockquote,
		CustomImage,
		CustomTable,
		CustomTableHead,
		CustomTableBody,
		CustomTableRow,
		CustomTableCell,
		CustomList,
		CustomListItem,
		CustomHeading,
		CustomCodeSpan,
		CustomCode,
		DarkModeLinker
	} from '$lib/renderers';
	import AppTitle from '$lib/components/AppTitle.svelte';

	// text, em <em>, strong <strong><b>, del <del>, <html> kept as-is.
	// https://github.com/pablo-abc/svelte-markdown/blob/main/src/renderers/Html.svelte

	export let data: PageData;
</script>

<AppTitle title={data.post.title} />

<DarkModeLinker />

<article>
	<SvelteMarkdown
		source={data.post.content}
		renderers={{
			paragraph: CustomParagraph,
			hr: Hr,
			blockquote: CustomBlockquote,
			link: A,
			image: CustomImage,
			table: CustomTable,
			tablehead: CustomTableHead,
			tablebody: CustomTableBody,
			tablerow: CustomTableRow,
			tablecell: CustomTableCell,
			list: CustomList,
			listitem: CustomListItem,
			heading: CustomHeading,
			codespan: CustomCodeSpan,
			code: CustomCode,
	}} />
</article>
