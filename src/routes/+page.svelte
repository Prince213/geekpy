<script lang="ts">
	import PyLinux from '$lib/pylinux';
	import { getContext, onMount } from 'svelte';
	import { env } from '$env/dynamic/public';

	const notifyError = getContext('notifyError') as (msg: string) => void;

	let code = '';
	let error: string | null = null;

	let initialized = false;
	let pylinux: PyLinux;

	const run = async () => {
		error = null;
		let escaped = JSON.stringify(code);
		await pylinux.exec(`echo -e ${escaped} > main.py`);
		if (!(await pylinux.calibrate())) {
			error = 'Geekpy engine loading script failed.';
			return;
		}
		const result = await pylinux.exec('python main.py');
		console.log(result);
	};

	onMount(async () => {
		pylinux = await new PyLinux(env.PUBLIC_RISCVEMU_CONFIG).boot();
		globalThis.pylinux = pylinux;
		if (!pylinux.calibrate('python example.py', 'Hello world')) {
			notifyError('Geekpy engine initialization failed.');
			return;
		}
		initialized = true;
	});
</script>

<h1>Welcome to SvelteKit</h1>
<p>Visit <a href="https://kit.svelte.dev">kit.svelte.dev</a> to read the documentation</p>
{#if initialized}
	<textarea bind:value={code} />
	<button on:click={run}>Run</button>
{/if}
