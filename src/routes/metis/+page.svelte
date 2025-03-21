<script lang="ts">
	import { Effect } from 'effect';
	import { metisMutationOptions } from './metisMutation.svelte';
	import { getMetisClient } from './metisClient.svelte';
	import TestQuery from './TestQuery.svelte';

	const client = getMetisClient();

	const testMutationOptions = metisMutationOptions({
		mutationFn: (data: { name: string }) =>
			Effect.gen(function* () {
				return {
					message: `Hello there ${data.name}`
				};
			}),
		onError: async (error) => {
			console.error(error);
		},
		onSuccess: async ({ message }) => {
			console.log(message);
		}
	});

	const testMutation = client.createMutation(testMutationOptions);
</script>

<div>
	<h3 class="text-2xl font-bold">Metis: the second version of the svelte query stuff</h3>
	<p>work in progress</p>
</div>

<a href="/metis/sub" class="text-blue-500 underline">go to sub page</a>
<a href="/metis/sub/empty" class="text-blue-500 underline">go to empty sub page</a>

<div>
	<button onclick={() => testMutation.mutate({ name: 'John' })}>mutate</button>
</div>

{#if testMutation.isLoading}
	<div>loading...</div>
{/if}

{#if testMutation.error}
	<div>error: {String(testMutation.error)}</div>
{/if}

<div class="flex items-center justify-center gap-4">
	<TestQuery idx={1} />
	<TestQuery idx={2} />
	<TestQuery idx={3} />
</div>
