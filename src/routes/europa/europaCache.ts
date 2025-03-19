import type { AnyInternalEuropaQueryRunFn } from './europaQuery';

export class EuropaCache {
	private promisesMap = new Map<
		string,
		{
			fn: AnyInternalEuropaQueryRunFn;
			fnPromise: Promise<any>;
			result:
				| {
						data: any;
						error: Error | undefined;
				  }
				| undefined;
		}
	>();

	constructor() {}

	flushForKey(key: string) {
		this.promisesMap.delete(key);
	}

	async getOrSetForKey(
		key: string,
		fn: AnyInternalEuropaQueryRunFn
	): Promise<{
		data: any;
		error: Error | undefined;
	}> {
		const currentPromise = this.promisesMap.get(key);

		if (currentPromise) {
			if (currentPromise.result) {
				return currentPromise.result;
			}

			const res = await currentPromise.fnPromise;

			return res;
		}

		const nPromise = fn();

		this.promisesMap.set(key, {
			fn,
			fnPromise: nPromise,
			result: undefined
		});

		const result = await nPromise;

		this.promisesMap.set(key, {
			fn,
			fnPromise: nPromise,
			result
		});

		return result;
	}
}

// steps:
// 1. check if there is a promise running for this key
// 2. if there is no promise running, create a new promise and add it to the map
// 3. if there is a promise running, return the promise
// 4. when the promise resolves, remove it from the map
