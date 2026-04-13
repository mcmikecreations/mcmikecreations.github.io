<script>
	import { setContext, onMount } from 'svelte'
	import Parser from './Parser.svelte'
	import { defaultOptions, defaultRenderers } from './markdown-parser';
	import { Lexer } from 'marked';
	import { key } from './context.js';
	import { Slugger } from './slugger.js';

	let {
		source = [],
		renderers = {},
		options = {},
		isInline = false,
		onparsed
	} = $props();

	let tokens = $state();
	let lexer = $state();
	let mounted = $state(false);

	let preprocessed = $derived(Array.isArray(source));
	let slugger = $derived(source ? new Slugger() : undefined);
	let combinedOptions = $derived({ ...defaultOptions, ...options });

	$effect(() => {
		if (preprocessed) {
			tokens = source;
		} else {
			lexer = new Lexer(combinedOptions);
			tokens = isInline ? lexer.inlineTokens(source) : lexer.lex(source);
			onparsed?.(new CustomEvent('parsed', { detail: tokens }));
		}
	});

	let combinedRenderers = $derived({ ...defaultRenderers, ...renderers });

	setContext(key, {
		/**
		 * @param {string} val
		 */
		slug: (val) => slugger ? slugger.slug(val) : '',
		getOptions: () => combinedOptions
	});

	$effect(() => {
		if (mounted && !preprocessed) {
			onparsed?.(new CustomEvent('parsed', { detail: tokens }));
		}
	});

	onMount(() => {
		mounted = true;
	});
</script>

<Parser {tokens} renderers={combinedRenderers} />