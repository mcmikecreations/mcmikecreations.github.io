<script lang="ts">
	/* eslint-disable svelte/no-at-html-tags */
	import hljs from 'highlight.js';
	import 'highlight.js/styles/github-dark-dimmed.min.css';

	interface Props {
		text?: string;
		lang?: string;
	}

	let { text = '', lang = '' }: Props = $props();

	const highlightedText = $derived(hljs.highlight(text, { language: lang ? lang : 'plaintext' }).value);
</script>

<pre class="hljs"><code class={lang ? `language-` + lang : ''}>{@html highlightedText}</code></pre>
