<script lang="ts">
	import CodeMirror from 'svelte-codemirror-editor';
	import { python } from '@codemirror/lang-python';
	import { githubLight, githubDark } from '@uiw/codemirror-theme-github';
	import { getContext, onMount } from 'svelte';
	import type { Writable } from 'svelte/store';

	export let value = '';

	const theme = getContext('theme') as Writable<'white' | 'g100'>;
	onMount(() => {
		theme.subscribe((value) => {
			editorTheme = value === 'white' ? githubLight : githubDark;
		});
	});

	let editorTheme = githubLight;
</script>

<div class="editor">
	<CodeMirror
		bind:value
		lang={python()}
		tabSize={4}
		theme={editorTheme}
		styles={{
			'*': {
				'font-family':
					"ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, 'Liberation Mono', monospace"
			}
		}}
	/>
</div>

<style>
	.editor {
		height: 100%;
	}
</style>
