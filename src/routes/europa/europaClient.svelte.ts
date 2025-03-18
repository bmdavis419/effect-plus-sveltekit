import { getContext, setContext } from 'svelte';
import {
	defaultEuropaQueryOptions,
	type AnyEuropaQuery,
	type EuropaQuery,
	type EuropaQueryDef,
	type EuropaQueryOptions
} from './europaQuery';

class EuropaClient {
	private queries: AnyEuropaQuery[] = [];

	constructor() {
		$effect(() => {
			const boundHandler = () => this.handleWindowFocus();
			document.addEventListener('visibilitychange', boundHandler);
			return () => {
				document.removeEventListener('visibilitychange', boundHandler);
			};
		});
	}

	private handleWindowFocus() {
		const isVisible = !document.hidden;

		if (isVisible) {
			const queriesToRerun = this.queries.filter((query) => {
				return query._def.options.refetchOnWindowFocus;
			});

			this.rerunQueries(queriesToRerun);
		}
	}

	private findQueriesByKey(key: string[]) {
		return this.queries.filter((query) => {
			const queryKey = query._def.key;
			return key.every((k, i) => k === queryKey[i]);
		});
	}

	private async rerunQueries(queries: AnyEuropaQuery[]) {
		const queryPromises = queries.map(async (query) => {
			try {
				query.isLoading = true;
				query.data = await query._def.resolver();
			} catch (error) {
				console.error('Query failed:', error);
				query.error = error as Error;
			} finally {
				query.isLoading = false;
			}
		});

		await Promise.all(queryPromises);
	}

	async invalidateQuery(key: string[]) {
		const queries = this.findQueriesByKey(key);

		await this.rerunQueries(queries);
	}

	createQuery<TOutput>(queryData: {
		queryFn: () => Promise<TOutput>;
		queryKey: string[];
		options?: Partial<EuropaQueryOptions>;
	}): EuropaQuery<TOutput> {
		const _def: EuropaQueryDef<TOutput> = {
			$types: { output: null as unknown as TOutput },
			key: queryData.queryKey,
			resolver: queryData.queryFn,
			options: {
				...defaultEuropaQueryOptions,
				...queryData.options
			}
		};

		let data = $state<TOutput | undefined>();
		let isLoading = $state(false);
		let error = $state<Error | undefined>();

		$effect(() => {
			const run = async () => {
				try {
					isLoading = true;
					error = undefined;
					data = await _def.resolver();
				} catch (e) {
					error = e as Error;
					console.error('Query failed:', e);
				} finally {
					isLoading = false;
				}
			};

			if (_def.options.refetchOnMount) {
				run();
			}
		});

		const refetch = async () => {
			try {
				isLoading = true;
				error = undefined;
				data = await _def.resolver();
			} catch (e) {
				error = e as Error;
				console.error('Query failed:', e);
			} finally {
				isLoading = false;
			}
		};

		const newQuery: EuropaQuery<TOutput> = {
			_def,
			refetch,
			get error() {
				return error;
			},
			set error(value) {
				error = value;
			},
			get data() {
				return data;
			},
			set data(value) {
				data = value;
			},
			get isLoading() {
				return isLoading;
			},
			set isLoading(value) {
				isLoading = value;
			}
		};

		this.queries.push(newQuery);

		return newQuery;
	}
}

const DEFAULT_KEY = '$_europa_client';

export const createEuropaClient = (key: string = DEFAULT_KEY) => {
	const client = new EuropaClient();
	return setContext(key, client);
};

export const getEuropaClient = (key: string = DEFAULT_KEY) => {
	return getContext<EuropaClient>(key);
};
