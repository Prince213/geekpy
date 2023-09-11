<script lang="ts">
	import AsyncLinux, { AsyncDaemon } from '$lib/asynclinux';
	import { Form, Button, TextInput, Tile, CodeSnippet } from 'carbon-components-svelte';
	import { onMount } from 'svelte';
	import { History, HistorySource } from '$lib/executors';

	export let config: string;
	export let onError: (msg: string) => void;
	export let value: string;

	let executor: AsyncLinux | null = null;
	let daemon: AsyncDaemon | null = null;

	let input: string | null = null;
	let exit: number | null = null;
	let output: string | null = null;

	const history: History = new History();

	const execute = async () => {
		if (!executor) return;
		const escaped = JSON.stringify(value);
		await executor.exec(`echo -e ${escaped} > main.py`);
		if (!(await executor?.calibrate())) {
			onError('Loading script failed.');
			return;
		}
		history.clear();
		daemon = new AsyncDaemon(async () => {
			if (!executor) return;
			output = history.from(await executor.exec(`cat stdout`));
		});
		exit = await executor.spawn('./main.sh');
		daemon.cancel();
		output = history.from(await executor.exec(`cat stdout`));
	};

	const puts = async (event: SubmitEvent) => {
		event.preventDefault();
		if (!input || !daemon || !executor) return;
		daemon.pause();
		output = history.from(await executor.exec(`cat stdout`));
		const escaped = JSON.stringify(input);
		await executor.exec(`echo -e ${escaped} > stdin`);
		history.push({ source: HistorySource.Input, value: input });
		daemon.resume();
	};

	const kill = async () => {
		if (!executor) return;
		await executor.kill();
	};

	onMount(async () => {
		executor = await new AsyncLinux(config).boot();
		globalThis.executor = executor;
		if (!(await executor.calibrate('python example.py', 'Hello world'))) {
			onError('Executor initialization failed.');
			return;
		}
	});
</script>

<Button on:click={execute}>Execute</Button>
<Button on:click={kill}>Kill</Button>
<Tile>
	{#if output}
		<CodeSnippet type="multi" code={output} />
	{:else}
		<p>Output will be shown here.</p>
	{/if}
</Tile>
<Form on:submit={puts}>
	<TextInput labelText="Input" placeholder="Enter your input here" bind:value={input} />
	<Button type="submit">Submit</Button>
</Form>
