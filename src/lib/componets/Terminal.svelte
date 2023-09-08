<script lang="ts">
	import JSLinux from '$lib/jslinux';
	import type { Linux } from '$lib/jslinux';
	import { onMount } from 'svelte';
	import { env } from '$env/dynamic/public';

	let terminal: HTMLElement;

	export let Base: ReturnType<typeof Linux> = JSLinux;

	onMount(async () => {
		new Base(env.PUBLIC_RISCVEMU_CONFIG).mount(terminal).boot();
	});
</script>

<div bind:this={terminal} />
