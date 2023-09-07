<script lang="ts">
	import { Header, Content, SkipToContent } from 'carbon-components-svelte';
	import { onMount, setContext } from 'svelte';
	import { writable } from 'svelte/store';

	const theme = writable('white');
	setContext('theme', theme);

	onMount(() => {
		theme.subscribe((value) => document?.documentElement?.setAttribute('theme', value));
	});
</script>

<svelte:head>
	<link rel="stylesheet" href="https://unpkg.com/carbon-components-svelte/css/all.css" />
</svelte:head>
<Header href="/">
	<svelte:fragment slot="platform">{'{Geekpy: 🐍}'}</svelte:fragment>
	<svelte:fragment slot="skip-to-content">
		<SkipToContent />
	</svelte:fragment>
</Header>
<Content>
	<slot />
</Content>
