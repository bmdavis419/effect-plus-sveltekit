<script>
	import { createMetisClient } from './metisClient.svelte';

	const { children } = $props();

	createMetisClient();
</script>

{@render children()}
