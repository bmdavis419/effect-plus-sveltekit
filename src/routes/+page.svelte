<script>
	import { getEuropaClient } from './europa/europaClient.svelte';

	export const { data } = $props();

	const client = getEuropaClient();

	$effect(() => {
		console.log('le client', client);
	});

	$inspect(data);
</script>

<h1>Welcome to SvelteKit</h1>
<p>Visit <a href="https://svelte.dev/docs/kit">svelte.dev/docs/kit</a> to read the documentation</p>

<form action="?/createShortLink" method="post">
	<button type="submit" class="rounded-md bg-blue-500 p-2 text-white hover:cursor-pointer"
		>testing send</button
	>
</form>
