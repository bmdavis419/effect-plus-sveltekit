<script lang="ts">
	import { getEuropaClient } from './europaClient.svelte.js';

	const client = getEuropaClient();

	const myFirstQuery = client.createQuery({
		queryFn: async () => {
			console.log('big boy got run');
			const randomNumber = Math.random();
			// await new Promise((resolve) => setTimeout(resolve, 100));

			// if (randomNumber > 0.5) {
			// 	throw new Error('random number is too big');
			// }

			return randomNumber;
		},
		queryKey: ['lul']
	});

	const myFirstMutation = client.createMutation({
		mutationFn: async (input: { name: string }) => {
			await new Promise((resolve) => setTimeout(resolve, 100));

			if (input.name === 'error') {
				throw new Error('name is error');
			}

			return {
				message: `Hello ${input.name}`
			};
		},
		options: {
			onSuccess: async (data) => {
				console.log('we sent your message:', data.message);
				await myFirstQuery.refetch();
			},
			onError: async (error) => {
				console.error('we failed to send your message:', error);
			}
		}
	});
</script>

<div>we making shitty react query at home</div>

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

<h2 class="pt-8 pb-4 text-2xl font-bold">mutation testing</h2>

<div>Mutation message: {myFirstMutation.data?.message}</div>

<button
	onclick={() => myFirstMutation.mutate({ name: 'b e a n' })}
	class="rounded-md bg-blue-500 px-4 py-2 text-white"
>
	{myFirstMutation.isLoading ? 'loading...' : 'mutate'}
</button>
