<script lang="ts">
	import { getContext } from 'svelte';
	import { PUBLIC_RISCVEMU_CONFIG } from '$env/static/public';
	import { breakpointObserver } from 'carbon-components-svelte';
	import AsyncExecutor from '$lib/componets/executors/AsyncExecutor.svelte';
	import Editor from '$lib/componets/Editor.svelte';
	import { pySum } from '$lib/examples';

	const notifyError = getContext('notifyError') as (msg: string) => void;
	const breakpointSize = breakpointObserver();
	const breakpointIsMobile = breakpointSize.smallerThan('md');

	let value = pySum;

	const onError = (msg: string) => {
		notifyError(msg);
	};
</script>

<div class="main">
	<h1>Hope SI100b finds you well.</h1>
	<p>
		Either it is true or not, Geekpy 🐍 will always be available for you as a python IDE on the web.
	</p>

	<section class="ide" style:padding={$breakpointIsMobile ? '' : '2rem'}>
		<div class="editor">
			<Editor bind:value />
		</div>
		<div class="executor">
			<AsyncExecutor config={PUBLIC_RISCVEMU_CONFIG} {onError} {value} />
		</div>
	</section>
</div>

<style>
	.main {
		display: flex;
		flex-direction: column;
		height: 100%;
	}

	.ide {
		width: 100%;
		flex: 1;
		display: grid;
		grid-template-columns: 1fr 1fr;
	}

	.editor {
		overflow: auto;
	}
</style>
