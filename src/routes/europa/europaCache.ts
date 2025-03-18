export class EuropaCache {
	private cache: Map<string, any> = new Map();

	constructor() {}

	get(key: string) {
		return this.cache.get(key);
	}

	set(key: string, value: any) {
		this.cache.set(key, value);
	}
}
