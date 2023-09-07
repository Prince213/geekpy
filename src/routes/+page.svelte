<script lang="ts">
	import Terminal from '$lib/componets/Terminal.svelte';
	import { getContext } from 'svelte';
	import type { Writable } from 'svelte/store';

	const theme: Writable<string> = getContext('theme');

	const changeTheme = () => {
		theme.update((current) => (current === 'white' ? 'g100' : 'white'));
	};
</script>

<h1>Welcome to SvelteKit</h1>
<p>Visit <a href="https://kit.svelte.dev">kit.svelte.dev</a> to read the documentation</p>
<button on:click={changeTheme}>x</button>
<Terminal />
