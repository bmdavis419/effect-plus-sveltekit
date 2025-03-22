<script lang="ts">
	import { Effect, pipe, Schema } from 'effect';
	import { getMetisClient } from './metisClient.svelte';
	import { metisQueryOptions } from './metisQuery.svelte';

	const { idx }: { idx: number } = $props();

	const client = getMetisClient();

	const testQueryOptions = metisQueryOptions({
		queryFn: ([name]) =>
			Effect.gen(function* () {
				console.log('query fn was called');
				const demoResponse = Effect.tryPromise(() => fetch(`/metis/demo`));

				const getResponseText = (response: Response) =>
					!response.ok
						? Effect.fail(new Error('your number is too big :('))
						: Effect.tryPromise(() => response.text());

				const responseJsonSchema = Schema.parseJson(
					Schema.Struct({
						randomNumber: Schema.Number
					})
				);

				const { randomNumber } = yield* pipe(
					demoResponse,
					Effect.flatMap((response) => getResponseText(response)),
					Effect.flatMap((responseText) => Schema.decode(responseJsonSchema)(responseText))
				);

				const randomToTwoDigits = Math.floor(randomNumber * 100);

				return `hello ${name}, your num is ${randomToTwoDigits}`;
			}),
		queryKey: ['test', 420] as const,
		config: {
			refetchOnMount: true,
			refetchOnNavigate: true,
			refetchOnWindowFocus: true
		}
	});

	const testQuery = client.createQuery(testQueryOptions);
</script>

<div class="flex w-[300px] flex-col gap-4 rounded-md bg-gray-100 p-4">
	<h3 class="text-2xl font-bold">Test Query, {idx}</h3>

	<ul class="list-disc">
		<li>Data: {testQuery.data}</li>
		<li>Error: {testQuery.error?.message}</li>
		<li>Is Loading: {testQuery.isLoading}</li>
	</ul>

	<button onclick={() => testQuery.refetch()} class="rounded-md bg-blue-500 p-2 text-white">
		Refetch
	</button>
</div>
