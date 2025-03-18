<script>
	import { getEuropaClient } from './europaClient.svelte.js';

	const client = getEuropaClient();

	const myFirstQuery = client.createQuery({
		queryFn: async () => {
			console.log('big boy got run');
			const randomNumber = Math.random();
			await new Promise((resolve) => setTimeout(resolve, 100));

			if (randomNumber > 0.5) {
				throw new Error('random number is too big');
			}

			return randomNumber;
		},
		queryKey: ['lul']
	});
</script>

<div>we making shitty react query at home</div>

{#if myFirstQuery.isLoading}
	<div>loading...</div>
{:else if myFirstQuery.error}
	<div>error: {myFirstQuery.error.message}</div>
{:else if myFirstQuery.data}
	<div>your random number is {myFirstQuery.data}</div>
{/if}

<!-- <button onclick={() => myFirstQuery.refetch()}>refetch test</button> -->

<button onclick={() => myFirstQuery.refetch()}>invalidate</button>
