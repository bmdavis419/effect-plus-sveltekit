import { Effect, Schema } from 'effect';

export const testSchema = Schema.parseJson(
	Schema.Struct({
		name: Schema.String,
		age: Schema.Number
	})
);

export const testRunSchema = Effect.gen(function* () {
	const encoded = yield* Schema.encode(testSchema)({
		name: 'asdf',
		age: 1313
	});

	yield* Effect.log(encoded);

	const decoded = yield* Schema.decode(testSchema)(encoded);

	return decoded;
});
