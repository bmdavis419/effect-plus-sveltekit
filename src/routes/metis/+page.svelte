<script lang="ts">
	import { Effect } from 'effect';
	import { createMetisQuery, metisQueryOptions } from './metisQuery.svelte';

	const testQueryOptions = metisQueryOptions({
		queryFn: ([name]) =>
			Effect.gen(function* () {
				const response = yield* Effect.promise(() => fetch(`/metis/demo`));

				if (!response.ok) {
					yield* Effect.fail(new Error(`something went wrong fetching: ${response.text}`));
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
	$inspect(testQuery.error);
</script>

<div>
	<h3 class="text-2xl font-bold">Metis: the second version of the svelte query stuff</h3>
	<p>work in progress</p>
</div>

<div>
	<button onclick={() => testQuery.refetch()}>refetch</button>
</div>

{#if testQuery.isLoading}
	<div>loading...</div>
{/if}

{#if testQuery.error}
	<div>error: {String(testQuery.error)}</div>
{/if}

{#if testQuery.data}
	<div>{testQuery.data}</div>
{/if}
