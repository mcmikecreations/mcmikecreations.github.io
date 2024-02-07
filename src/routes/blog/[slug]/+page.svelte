<script lang="ts">
	import type { PageData } from './$types';
	import SvelteMarkdown from 'svelte-markdown';
	import { P, Hr, A } from 'flowbite-svelte';
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
		CustomCode
	} from '$lib/svelteMarkdownRenderers/CustomElements';
	import 'highlight.js/styles/stackoverflow-light.min.css';

	// text, em <em>, strong <strong><b>, del <del>, <html> kept as-is.
	// https://github.com/pablo-abc/svelte-markdown/blob/main/src/renderers/Html.svelte

	export let data: PageData;
</script>

<article>
	<SvelteMarkdown
		source={data.content}
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
