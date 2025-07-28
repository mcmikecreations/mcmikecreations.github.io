<script lang="ts">
	/* eslint-disable svelte/no-at-html-tags */
	import hljs from 'highlight.js';
	import 'highlight.js/styles/github-dark-dimmed.min.css';

	interface Props {
		raw?: string;
	}

	let { raw = '' }: Props = $props();

	const highlightedText = hljs.highlight(raw.replace(/`/g, ''), { language: 'plaintext' }).value;
</script>

<code class="hljs language-plaintext">{@html highlightedText}</code>
