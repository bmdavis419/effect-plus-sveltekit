<script lang="ts">
	import { Effect } from 'effect';
	import { createMetisQuery, metisQueryOptions } from './metisQuery.svelte';

	const testQueryOptions = metisQueryOptions({
		queryFn: ([name]) =>
			Effect.gen(function* () {
				console.log(`hello ${name}`);

				const randomNumber = Math.random();

				yield* Effect.sleep(1000);

				if (randomNumber < 0.5) {
					return `hello mr. ${name}, your number is ${randomNumber}`;
				} else {
					yield* Effect.fail(new Error(`sorry ${name}, your number is too big :(`));
					return '';
				}
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
	<button onclick={() => testQuery.refetch()}>refetch</button>
</div>

{#if testQuery.isLoading}
	<div>loading...</div>
{/if}

{#if testQuery.error}
	<div>error: {testQuery.error.message}</div>
{/if}

{#if testQuery.data}
	<div>{testQuery.data}</div>
{/if}
