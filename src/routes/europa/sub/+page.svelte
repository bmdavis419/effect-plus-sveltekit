<script>
	import { createFirstQuery } from '../clientHelpers.js';

	const myFirstQuery = createFirstQuery();
</script>

<div>sub</div>

<nav class="flex gap-4">
	<a href="/europa" class="rounded-md bg-blue-500 px-4 py-2 text-white">home</a>
</nav>

<h2 class="pt-8 pb-4 text-2xl font-bold">query testing</h2>

{#if myFirstQuery.isLoading}
	<div>loading...</div>
{:else if myFirstQuery.error}
	<div>error: {myFirstQuery.error.message}</div>
{:else if myFirstQuery.data}
	<div>your random number is {myFirstQuery.data}</div>
{/if}

<button onclick={() => myFirstQuery.refetch()} class="rounded-md bg-blue-500 px-4 py-2 text-white">
	{myFirstQuery.isLoading ? 'loading...' : 'invalidate'}
</button>
