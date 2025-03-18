<script>
	import { createEuropaClient } from './europaClient.svelte';

	const { children } = $props();

	createEuropaClient();
</script>

<div class="p-3">
	{@render children()}
</div>
