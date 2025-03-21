import { SvelteMap } from 'svelte/reactivity';
import type { AnyMetisQueryInternalRunResolver } from './metisQuery.svelte';

export class MetisQueryCache {
	private cache = new Map<
		string,
		{
			run: AnyMetisQueryInternalRunResolver;
			runPromise: ReturnType<AnyMetisQueryInternalRunResolver>;
			result: Awaited<ReturnType<AnyMetisQueryInternalRunResolver>> | undefined;
			refetchOnWindowFocus: boolean;
		}
	>();

	private reactiveDataCache = new SvelteMap<
		string,
		Awaited<ReturnType<AnyMetisQueryInternalRunResolver>>
	>();

	private async handleWindowFocus() {
		const isVisible = !document.hidden;

		if (isVisible) {
			// const promisesToRun = this.cache.keys().map(async (key) => {
			// 	const cacheItem = this.cache.get(key);
			// 	if (cacheItem && cacheItem.refetchOnWindowFocus) {
			// 		this.flushForKey(key);
			// 		await this.getOrSetForKey({
			// 			key,
			// 			fn: cacheItem.run,
			// 			refetchOnWindowFocus: cacheItem.refetchOnWindowFocus
			// 		});
			// 	}
			// });
			// await Promise.all(promisesToRun);
			const keys = Array.from(this.cache.keys());
			const promises = keys.map(async (key) => {
				const cacheItem = this.cache.get(key);
				if (cacheItem && cacheItem.refetchOnWindowFocus) {
					this.flushForKey(key);

					const newPromise = cacheItem.run();

					this.cache.set(key, {
						...cacheItem,
						runPromise: newPromise
					});

					const res = await newPromise;

					this.cache.set(key, {
						...cacheItem,
						result: res
					});

					this.reactiveDataCache.set(key, res);
				}
			});

			await Promise.all(promises);
		}
	}

	constructor() {
		$effect(() => {
			const boundHandler = () => this.handleWindowFocus();
			document.addEventListener('visibilitychange', boundHandler);
			return () => {
				document.removeEventListener('visibilitychange', boundHandler);
			};
		});
	}

	flushForKey(key: string) {
		this.cache.delete(key);
		this.reactiveDataCache.delete(key);
	}

	getReactiveDataForKey(key: string) {
		return this.reactiveDataCache.get(key);
	}

	setReactiveDataForKey(key: string, data: Awaited<ReturnType<AnyMetisQueryInternalRunResolver>>) {
		this.reactiveDataCache.set(key, data);
	}

	async getOrSetForKey(data: {
		key: string;
		fn: AnyMetisQueryInternalRunResolver;
		refetchOnWindowFocus: boolean;
	}): ReturnType<AnyMetisQueryInternalRunResolver> {
		const { key, fn, refetchOnWindowFocus } = data;

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
			result: undefined,
			refetchOnWindowFocus
		});

		const result = await nPromise;

		this.cache.set(key, {
			run: fn,
			runPromise: nPromise,
			result,
			refetchOnWindowFocus
		});

		this.reactiveDataCache.set(key, result);

		return result;
	}
}
