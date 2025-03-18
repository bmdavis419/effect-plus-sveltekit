<script>
	import { createEuropaClient } from './europaClient.svelte';

	const { children } = $props();

	createEuropaClient();
</script>

{@render children()}
