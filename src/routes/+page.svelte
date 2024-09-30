<script lang="ts">
	import { getContext } from 'svelte';
	import { PUBLIC_RISCVEMU_CONFIG } from '$env/static/public';
	import { breakpointObserver } from 'carbon-components-svelte';
	import AsyncExecutor from '$lib/componets/executors/AsyncExecutor.svelte';
	import Editor from '$lib/componets/Editor.svelte';
	import { SUM_OF_TWO } from '$lib/examples';
	import PyExecutor from '$lib/componets/executors/PyExecutor.svelte';

	const notifyError = getContext('notifyError') as (msg: string) => void;
	const breakpointSize = breakpointObserver();
	const breakpointIsMobile = breakpointSize.smallerThan('md');

	let value = SUM_OF_TWO;

	const onError = (msg: string) => {
		notifyError(msg);
	};
</script>

<div class="main">
	<h1>Hope SI100b finds you well.</h1>
	<p>
		Either it is true or not, Geekpy 🐍 will always be available for you as a python IDE on the web.
	</p>

	<section class={$breakpointIsMobile ? 'ide-mobile' : 'ide'}>
		<div class="editor">
			<Editor bind:value />
		</div>
		<div class="executor">
			<!-- <PyExecutor config={PUBLIC_RISCVEMU_CONFIG} {onError} {value} /> -->
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
		padding: 2rem;
		flex: 1;
		display: grid;
		grid-template-columns: 1fr 1fr;
	}

	.ide-mobile {
		width: 100%;
		padding: 0;
	}

	.editor {
		overflow: auto;
	}
</style>
