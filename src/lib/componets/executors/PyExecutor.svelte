<script lang="ts">
	import PyLinux from '$lib/pylinux';
	import { Form, Button, TextInput, Tile } from 'carbon-components-svelte';
	import { onMount } from 'svelte';

	export let config: string;
	export let onError: (msg: string) => void;
	export let value: string;

	let executor: PyLinux | null = null;

	let input: string | null = null;
	let exit: number | null = null;
	let output: string | null = null;

	const execute = async () => {
		if (!executor) return;
		const escaped = JSON.stringify(value);
		await executor.exec(`echo -e ${escaped} > main.py`);
		if (!(await executor?.calibrate())) {
			onError('Loading script failed.');
			return;
		}
		output = '';
		await executor.exec('python main.py', true);
	};

	const puts = async (event: SubmitEvent) => {
		event.preventDefault();
		if (!input || !executor) return;
		executor.cmd(input);
	};

	const abort = async () => {
		if (!executor) return;
		executor.abort();
	};

	onMount(async () => {
		executor = await new PyLinux(config, (str) => {
			if (output != null) output += str;
		}).boot();
		globalThis.executor = executor;
		if (!(await executor.calibrate('python example.py', 'Hello world'))) {
			onError('Executor initialization failed.');
			return;
		}
	});
</script>

<Button on:click={execute}>Execute</Button>
<Button on:click={abort}>Kill</Button>
<Tile>
	{#if output}
		<pre>{output}</pre>
	{:else}
		<p>Output will be shown here.</p>
	{/if}
</Tile>
<Form on:submit={puts}>
	<TextInput labelText="Input" placeholder="Enter your input here" bind:value={input} />
	<Button type="submit">Submit</Button>
</Form>
