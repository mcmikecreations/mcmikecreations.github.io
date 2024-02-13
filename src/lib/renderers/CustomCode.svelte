<script>
	/* eslint-disable svelte/no-at-html-tags */
	import hljs from 'highlight.js';

	export let text = '';
	export let lang = '';

	const highlightedText = hljs.highlight(text, { language: lang ? lang : 'plaintext' }).value;
</script>

<pre class="hljs"><code class={lang ? `language-` + lang : ''}>{@html highlightedText}</code></pre>
