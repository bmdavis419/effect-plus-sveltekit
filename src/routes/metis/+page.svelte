<script lang="ts">
	import { Effect } from 'effect';
	import { createMetisQuery, metisQueryOptions } from './metisQuery.svelte';
	import { createMetisMutation, metisMutationOptions } from './metisMutation.svelte';

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

	const testMutation = createMetisMutation(testMutationOptions);

	const testQueryOptions = metisQueryOptions({
		queryFn: ([name]) =>
			Effect.gen(function* () {
				const response = yield* Effect.promise(() => fetch(`/metis/demo`));

				if (!response.ok) {
					yield* Effect.fail(new Error(`your number is too big :(`));
					return '';
				}

				const { randomNumber } = yield* Effect.promise(
					() => response.json() as Promise<{ randomNumber: number }>
				);

				return `hello mr. ${name}, your number is ${randomNumber}`;
			}),
		queryKey: ['test'] as const
	});

	const testQuery = createMetisQuery(testQueryOptions);
</script>

<div>
	<h3 class="text-2xl font-bold">Metis: the second version of the svelte query stuff</h3>
	<p>work in progress</p>
</div>

<div>
	<button onclick={() => testMutation.mutate({ name: 'John' })}>mutate</button>
</div>

{#if testMutation.isLoading}
	<div>loading...</div>
{/if}

{#if testMutation.error}
	<div>error: {String(testMutation.error)}</div>
{/if}

<div>
	<button onclick={() => testQuery.refetch()}>refetch</button>
</div>

{#if testQuery.isLoading}
	<div>loading...</div>
{/if}

{#if testQuery.error}
	<div>error: {String(testQuery.error.message)}</div>
{/if}

{#if testQuery.data}
	<div>{testQuery.data}</div>
{/if}
