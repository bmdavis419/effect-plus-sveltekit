// this could be turned into a directory, this is just a simple example

import { Effect } from 'effect';
import { RouteFunction } from '.';
import { redisGetShortLink } from '../redis';

export const loadHomepage = Effect.gen(function* () {
	const routeFunction = yield* RouteFunction;

	const url = yield* routeFunction.use((event) => event.params);

	const test = yield* redisGetShortLink('test');

	yield* Effect.logInfo(url);

	return {
		hello: 'world',
		test
	};
});
