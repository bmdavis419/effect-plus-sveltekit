import type { RequestEvent } from '@sveltejs/kit';
import { createApexQuery, createApexRouter } from '$lib/apex/query.js';
import { runApexQuery } from '$lib/apex/server.js';
import { Schema } from 'effect';

const firstSchema = Schema.Struct({
	name: Schema.String,
	age: Schema.Number
});

const firstSchemaJson = Schema.parseJson(firstSchema);

const router = createApexRouter();

const firstQuery = createApexQuery()
	.input(firstSchemaJson)
	.query((data) => {
		console.log('here is the input :0', data.input);

		return {
			doubled: data.input.age * 2
		};
	});

router.addRoute(firstQuery.query);

export const load = (event) => {
	// Simulating a generic handler that only knows the ID
	const id = firstQuery.def.id;
	const queryInfo = router.getRoute(id);

	const result = runApexQuery({
		query: queryInfo,
		input: JSON.stringify({
			name: 'asdf',
			age: 1313
		}),
		request: event
	});

	return {
		result
	};
};

// Example of a type-safe generic handler
const handleApexRequest = async (id: string, input: unknown, event: RequestEvent) => {
	const queryInfo = router.getRoute(id);
	return runApexQuery({
		query: queryInfo,
		input: JSON.stringify(input),
		request: event
	});
};
