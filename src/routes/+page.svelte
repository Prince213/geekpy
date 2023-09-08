<script lang="ts">
	import Terminal from '$lib/componets/Terminal.svelte';
	import PyLinux from '$lib/pylinux';
	import { getContext } from 'svelte';

	const changeTheme = getContext('changeTheme') as () => void;
</script>

<h1>Welcome to SvelteKit</h1>
<p>Visit <a href="https://kit.svelte.dev">kit.svelte.dev</a> to read the documentation</p>
<button on:click={changeTheme}>x</button>
<Terminal Base={PyLinux} />
