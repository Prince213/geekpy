<script lang="ts">
	import { Header, Content, SkipToContent, ToastNotification } from 'carbon-components-svelte';
	import { onMount, setContext } from 'svelte';
	import { writable, type Writable } from 'svelte/store';
	import { debounce } from 'ts-debounce';

	const theme = writable('white');
	setContext('changeTheme', () => {
		theme.update((current) => (current === 'white' ? 'g100' : 'white'));
	});

	const error: Writable<{ reason: string; when: string } | null> = writable(null);
	setContext(
		'notifyError',
		debounce((message: string) => {
			error.set({
				reason: message,
				when: new Date().toLocaleTimeString()
			});
			setTimeout(() => error.set(null), 5000);
		})
	);

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
{#if $error}
	<ToastNotification title="Error" subtitle={$error.reason} caption={$error.when} />
{/if}
