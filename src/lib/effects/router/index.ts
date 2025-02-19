import { error, type RequestEvent } from '@sveltejs/kit';
import { Effect, Context, Layer } from 'effect';
import type { RouteParams } from '../../../routes/$types';

type EventParam = RequestEvent<RouteParams, string>;

interface RouteFunctionImpl {
	use: <T>(fn: (event: EventParam) => T) => Effect.Effect<Awaited<T>, never, never>;
}

export class RouteFunction extends Context.Tag('RouteFunction')<
	RouteFunction,
	RouteFunctionImpl
>() {}

const make = (event: EventParam) =>
	Effect.gen(function* () {
		return RouteFunction.of({
			use: <T>(fn: (event: EventParam) => T) =>
				Effect.gen(function* () {
					const result = yield* Effect.try({
						try: () => fn(event),
						catch: (e) => error(500, 'Sync internal error')
					});

					if (result instanceof Promise) {
						return yield* Effect.tryPromise({
							try: () => result,
							catch: (e) => error(500, 'Async internal error')
						});
					} else {
						return result;
					}
				})
		});
	});

export const routeFunctionLayer = (event: EventParam) => Layer.scoped(RouteFunction, make(event));
