<script lang="ts">
	import { getContext, onMount } from 'svelte';
	import type { Writable } from 'svelte/store';

	const theme: Writable<string> = getContext('theme');

	const changeTheme = () => {
		theme.update((current) => (current === 'white' ? 'g100' : 'white'));
	};

	onMount(async () => {
		await import('$lib/os/term.js');
		await import('$lib/os/jslinux.js');
	});
</script>

<h1>Welcome to SvelteKit</h1>
<p>Visit <a href="https://kit.svelte.dev">kit.svelte.dev</a> to read the documentation</p>
<button on:click={changeTheme}>x</button>

<div id="term_wrap">
	<div id="term_container" />
	<div>
		<textarea id="term_paste" cols="10" rows="1" autocorrect="off">Paste Here</textarea>
		<label>
			<img title="Upload files" src="public/images/upload-icon.png" /><input
				type="file"
				id="files"
				multiple
			/>
		</label>
		<progress id="net_progress" />
	</div>
</div>
