<script>
	/* eslint-disable svelte/no-at-html-tags */
	import hljs from 'highlight.js';
	import 'highlight.js/styles/github-dark-dimmed.min.css';

	export let raw = '';

	const highlightedText = hljs.highlight(raw.replace(/`/g, ''), { language: 'plaintext' }).value;
</script>

<code class="hljs language-plaintext">{@html highlightedText}</code>
