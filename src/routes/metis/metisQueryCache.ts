import type { AnyMetisQueryInternalRunResolver } from './metisQuery.svelte';

export class MetisQueryCache {
	private cache = new Map<
		string,
		{
			run: AnyMetisQueryInternalRunResolver;
			runPromise: ReturnType<AnyMetisQueryInternalRunResolver>;
			result: Awaited<ReturnType<AnyMetisQueryInternalRunResolver>> | undefined;
		}
	>();

	constructor() {}

	flushForKey(key: string) {
		this.cache.delete(key);
	}

	async getOrSetForKey(data: {
		key: string;
		fn: AnyMetisQueryInternalRunResolver;
	}): ReturnType<AnyMetisQueryInternalRunResolver> {
		const { key, fn } = data;

		const currentPromise = this.cache.get(key);

		if (currentPromise) {
			if (currentPromise.result) {
				return currentPromise.result;
			}

			const res = await currentPromise.runPromise;

			return res;
		}

		const nPromise = fn();

		this.cache.set(key, {
			run: fn,
			runPromise: nPromise,
			result: undefined
		});

		const result = await nPromise;

		this.cache.set(key, {
			run: fn,
			runPromise: nPromise,
			result
		});

		return result;
	}
}
