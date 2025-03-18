export class EuropaLock {
	private promisesMap = new Map<string, Promise<any>>();

	constructor() {}

	async lock(key: string, fn: () => Promise<any>) {
		console.log('in the lock');
		if (this.promisesMap.has(key)) {
			const promise = this.promisesMap.get(key);

			console.log('returning existing promise', promise);
			return this.promisesMap.get(key);
		}

		console.log('LOCKING', key);

		const promise = fn();
		this.promisesMap.set(key, promise);
		return promise;
	}
}

// steps:
// 1. check if there is a promise running for this key
// 2. if there is no promise running, create a new promise and add it to the map
// 3. if there is a promise running, return the promise
// 4. when the promise resolves, remove it from the map
