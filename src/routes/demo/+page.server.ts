import type { RequestEvent } from '@sveltejs/kit';
import { Effect, Schema } from 'effect';

type ApexQuery<I, O> = {
	query: (data: { input: I }) => O;
	id: string;
	schema: Schema.SchemaClass<I, string, never>;
	_types: {
		input: I;
		output: O;
	};
};

const createApexQuery = () => {
	const input = <I>(schema: Schema.SchemaClass<I, string, never>) => {
		type InputType = Schema.Schema.Type<typeof schema>;

		const query = <O>(fn: (data: { input: InputType }) => O): ApexQuery<InputType, O> => {
			type OutputType = O;

			const id = crypto.randomUUID();

			const route: ApexQuery<InputType, OutputType> = {
				id,
				schema,
				query: fn,
				_types: {} as any
			};

			return route;
		};

		return {
			query
		};
	};

	return {
		input
	};
};

// all the things that a query will need to keep track of
// - the input schema
// - the output schema

export const load = () => {
	const demoTesting = createApexQuery()
		.input(testSchemaJson)
		.query((data) => {
			console.log('this is your data wow', data);

			return data.input.age * 4;
		});

	// Example of extracting types
	type DemoInputType = typeof demoTesting._types.input;
	type DemoOutputType = typeof demoTesting._types.output;

	const result = demoTesting.query({
		input: {
			name: 'asdf',
			age: 1313
		}
	});

	console.log(result);

	return {
		result
	};
};

const testSchema = Schema.Struct({
	name: Schema.String,
	age: Schema.Number
});

const testSchemaJson = Schema.parseJson(testSchema);

const handleGrabBody = (event: RequestEvent) =>
	Effect.gen(function* () {
		const bodyText = yield* Effect.promise(async () => {
			return await event.request.text();
		});

		const decodedBody = yield* Schema.decode(testSchemaJson)(bodyText);

		return decodedBody;
	});

export const actions = {
	actionDemo: async (event) => {
		const result = await Effect.runPromise(handleGrabBody(event));

		return result;
	}
};
