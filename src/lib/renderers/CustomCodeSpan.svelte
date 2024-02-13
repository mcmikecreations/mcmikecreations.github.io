<script>
	/* eslint-disable svelte/no-at-html-tags */
	import hljs from 'highlight.js';

	export let raw = '';

	const highlightedText = hljs.highlight(raw.replace(/`/g, ''), { language: 'plaintext' }).value;
</script>

<code class="hljs language-plaintext">{@html highlightedText}</code>
