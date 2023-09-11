<script lang="ts">
	import {
		Header,
		Content,
		SkipToContent,
		ToastNotification,
		HeaderUtilities,
		HeaderGlobalAction,
		Theme
	} from 'carbon-components-svelte';
	import { onMount, setContext } from 'svelte';
	import { writable, type Writable } from 'svelte/store';
	import { debounce } from 'ts-debounce';
	import BrightnessContrast from 'carbon-icons-svelte/lib/BrightnessContrast.svelte';
	import { slide } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';

	const theme: Writable<'white' | 'g100' | undefined> = writable(undefined);
	setContext('theme', theme);
	const changeTheme = () => {
		theme.update((current) => (current === 'white' ? 'g100' : 'white'));
	};
	setContext('changeTheme', changeTheme);

	const error: Writable<{ reason: string; when: string } | null> = writable(null);
	setContext('error', error);
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
		if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
			theme.set('g100');
		} else {
			theme.set('white');
		}
	});
</script>

<svelte:head>
	<link rel="stylesheet" href="https://unpkg.com/carbon-components-svelte/css/all.css" />
</svelte:head>

<Theme bind:theme={$theme} />

<section class="main">
	<Header href="/">
		<svelte:fragment slot="platform">{'{Geekpy: 🐍}'}</svelte:fragment>
		<svelte:fragment slot="skip-to-content">
			<SkipToContent />
		</svelte:fragment>
		<HeaderUtilities>
			<HeaderGlobalAction icon={BrightnessContrast} on:click={changeTheme} />
		</HeaderUtilities>
	</Header>
	<main class="content"><slot /></main>

	{#if $error}
		<div
			class="error"
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
</section>

<style>
	.error {
		position: fixed;
		bottom: 0;
		right: 0;
	}

	.main {
		height: calc(100vh - 3rem);
	}

	.content {
		height: 100%;
		margin-top: 3rem;
		padding: 2rem;
	}
</style>
