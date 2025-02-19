import { Effect } from 'effect';
import { RouteFunction } from '.';
import { MyRedis } from '../redis';

export const endpointRedirectUrl = Effect.gen(function* () {
	const routeFunction = yield* RouteFunction;

	// gross TS stuff here but idgaf about all the generic nonsense/complexity to make this work
	const slug = yield* routeFunction.use((event) => (event.params as { slug: string }).slug);
});
