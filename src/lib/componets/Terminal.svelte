<script lang="ts">
	import JSLinux from '$lib/jslinux';
	import { onMount } from 'svelte';

	let terminal: HTMLElement;
	let jslinux: JSLinux;

	onMount(async () => {
		jslinux = new JSLinux('root-riscv64.cfg').mount(terminal).boot();
	});
</script>

<div bind:this={terminal} />
