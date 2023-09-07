<script lang="ts">
	import JSLinux from '$lib/jslinux';
	import { onMount } from 'svelte';
	import { env } from '$env/dynamic/public';

	let terminal: HTMLElement;
	let jslinux: JSLinux;

	onMount(async () => {
		jslinux = new JSLinux(env.PUBLIC_RISCVEMU_CONFIG).mount(terminal).boot();
	});
</script>

<div bind:this={terminal} />
