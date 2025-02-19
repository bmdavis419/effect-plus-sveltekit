import { Effect } from 'effect';

export const firstEffect = Effect.gen(function* () {
	yield* Effect.logInfo('running first effect');

	const result = {
		message: 'Hello, world!'
	};

	return result;
});
