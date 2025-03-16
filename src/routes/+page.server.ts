import { Effect, Layer } from 'effect';
import { loadHomepage } from '$lib/effects/router/load.js';
import { routeFunctionLayer } from '$lib/effects/router/index.js';
import { redisLayer } from '$lib/effects/redis.js';
import { actionHomeCreate } from '$lib/effects/router/actions';
import { testRunSchema } from '$lib/effects/schema';

export const load = async (event) => {
	// const layer = routeFunctionLayer(event);

	const result = await Effect.runPromise(testRunSchema);

	console.log(result);

	return result;

	// const layer = Layer.mergeAll(routeFunctionLayer(event), redisLayer);

	// return Effect.runPromise(loadHomepage.pipe(Effect.provide(layer)));
};

export const actions = {
	createShortLink: async () => {
		const layer = redisLayer;

		return Effect.runPromise(actionHomeCreate.pipe(Effect.provide(layer)));
	}
};
