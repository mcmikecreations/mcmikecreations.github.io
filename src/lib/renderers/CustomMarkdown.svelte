<script>
	import {
		CustomBlockquote, CustomCode, CustomCodeSpan, CustomHeading,
		CustomImage, CustomList, CustomListItem,
		CustomParagraph,
		CustomTable, CustomTableBody, CustomTableCell,
		CustomTableHead, CustomTableRow, DarkModeLinker
	} from '$lib/renderers/index.js';
	import { A, Hr } from 'flowbite-svelte';
	import SvelteMarkdown from 'svelte-markdown';

	// text, em <em>, strong <strong><b>, del <del>, <html> kept as-is.
	// https://github.com/pablo-abc/svelte-markdown/blob/main/src/renderers/Html.svelte

	export let source = '';
</script>

<SvelteMarkdown
	{source}
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