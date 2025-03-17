import type { RequestEvent } from '@sveltejs/kit';
import type { ApexQuery, DefaultValue } from './types';
import { Schema } from 'effect';
import { Effect } from 'effect';

const handleParseInput = <InputType>(data: {
	schema: Schema.SchemaClass<InputType, string, never>;
	event: RequestEvent;
}) =>
	Effect.gen(function* () {
		const bodyText = yield* Effect.promise(async () => {
			return await data.event.request.text();
		});

		const decodedBody = yield* Schema.decode(data.schema)(bodyText);

		return decodedBody;
	});

export const runApexQuery = async <InputType, OutputType>(data: {
	query: ApexQuery<DefaultValue<InputType, void>, OutputType>;
	input: string;
	request: RequestEvent;
}): Promise<OutputType> => {
	const { query } = data;

	const parsedInput = await Effect.runPromise(
		handleParseInput({
			schema: query.schema,
			event: data.request
		})
	);

	const result = query.query({
		input: parsedInput,
		request: data.request
	});

	return result;
};
