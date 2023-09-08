<script lang="ts">
	import {
		Header,
		Content,
		SkipToContent,
		ToastNotification,
		HeaderUtilities,
		HeaderGlobalAction
	} from 'carbon-components-svelte';
	import { onMount, setContext } from 'svelte';
	import { writable, type Writable } from 'svelte/store';
	import { debounce } from 'ts-debounce';
	import BrightnessContrast from 'carbon-icons-svelte/lib/BrightnessContrast.svelte';
	import { slide } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';

	const theme = writable('white');
	const changeTheme = () => {
		theme.update((current) => (current === 'white' ? 'g100' : 'white'));
	};
	setContext('changeTheme', changeTheme);

	const error: Writable<{ reason: string; when: string } | null> = writable(null);
	const notifyError = debounce((message: string) => {
		error.set({
			reason: message,
			when: new Date().toLocaleTimeString()
		});
		setTimeout(() => error.set(null), 5000);
	});
	setContext('notifyError', notifyError);
	const cancelError = () => {
		notifyError.cancel();
		error.set(null);
	};

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
	<HeaderUtilities>
		<HeaderGlobalAction icon={BrightnessContrast} on:click={changeTheme} />
	</HeaderUtilities>
</Header>
<Content>
	<slot />
</Content>
{#if $error}
	<div
		class="error-container"
		transition:slide={{ delay: 250, duration: 300, easing: quintOut, axis: 'x' }}
	>
		<ToastNotification
			title="Error"
			subtitle={$error.reason}
			caption={$error.when}
			on:close={cancelError}
		/>
	</div>
{/if}

<style>
	.error-container {
		position: fixed;
		bottom: 0;
		right: 0;
	}
</style>
