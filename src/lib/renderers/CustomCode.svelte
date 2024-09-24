<script>
	/* eslint-disable svelte/no-at-html-tags */
	import hljs from 'highlight.js';
	import 'highlight.js/styles/github-dark-dimmed.min.css';

	export let text = '';
	export let lang = '';

	const highlightedText = hljs.highlight(text, { language: lang ? lang : 'plaintext' }).value;
</script>

<pre class="hljs mb-4 p-2"><code class={lang ? `language-` + lang : ''}>{@html highlightedText}</code></pre>
