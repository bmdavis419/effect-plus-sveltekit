import { getContext, setContext } from 'svelte';
import {
	defaultEuropaQueryConfig,
	type AnyEuropaQuery,
	type EuropaQuery,
	type EuropaQueryDef,
	type EuropaQueryKey,
	type EuropaQueryOptions,
	type EuropaQueryConfig
} from './europaQuery';
import {
	defaultEuropaMutationOptions,
	type EuropaMutation,
	type EuropaMutationDef,
	type EuropaMutationOptions
} from './europaMutation';
import { EuropaCache } from './europaCache';

class EuropaClient {
	private queries: AnyEuropaQuery[] = [];
	private cache: EuropaCache = new EuropaCache();

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
				return query._def.config.refetchOnWindowFocus;
			});

			this.rerunQueries(queriesToRerun);
		}
	}

	private findQueriesByKey(key: ReadonlyArray<any>) {
		return this.queries.filter((query) => {
			const queryKey = query._def.key;
			return key.every((k, i) => k === queryKey[i]);
		});
	}

	private async rerunQueries(queries: AnyEuropaQuery[]) {
		const queryPromises = queries.map(async (query) => {
			query.isLoading = true;
			const result = await this.cache.getOrSetForKey(
				query._def.key.toString(),
				query._def.internalRunFn
			);
			query.data = result.data;
			query.error = result.error;
			query.isLoading = false;
		});

		await Promise.all(queryPromises);
	}

	async invalidateQuery(key: string[]) {
		const queries = this.findQueriesByKey(key);

		await this.rerunQueries(queries);
	}

	createMutation<$Input, $Output>(mutationData: {
		mutationFn: (input: $Input) => Promise<$Output>;
		options?: Partial<EuropaMutationOptions<$Output>>;
	}): EuropaMutation<$Input, $Output> {
		const _def: EuropaMutationDef<$Input, $Output> = {
			$types: {
				input: null as unknown as $Input,
				output: null as unknown as $Output
			},
			resolver: mutationData.mutationFn,
			options: {
				...defaultEuropaMutationOptions,
				...mutationData.options
			}
		};

		let data = $state<$Output | undefined>();
		let isLoading = $state(false);
		let error = $state<Error | undefined>();

		const mutate = async (input: $Input) => {
			try {
				isLoading = true;
				error = undefined;
				data = await _def.resolver(input);
				if (_def.options.onSuccess) {
					await _def.options.onSuccess(data);
				}
			} catch (e) {
				error = e as Error;
				console.error('Mutation failed:', error);
				if (_def.options.onError) {
					await _def.options.onError(error);
				}
			} finally {
				isLoading = false;
			}
		};

		const newMutation: EuropaMutation<$Input, $Output> = {
			_def,
			mutate,
			get error() {
				return error;
			},
			get data() {
				return data;
			},
			get isLoading() {
				return isLoading;
			}
		};

		return newMutation;
	}

	createQuery<$Output, $Key extends ReadonlyArray<any>>(
		queryData: EuropaQueryOptions<$Output, $Key>
	): EuropaQuery<$Output, $Key> {
		const innerRun = async (resolver: () => Promise<$Output>) => {
			let innerError: Error | undefined;
			let innerData: $Output | undefined;

			try {
				innerData = await resolver();
			} catch (e) {
				innerError = e as Error;
			}

			return {
				data: innerData,
				error: innerError
			};
		};

		const _def: EuropaQueryDef<$Output, $Key> = {
			$types: {
				output: null as unknown as $Output,
				key: null as unknown as EuropaQueryKey<$Key>
			},
			key: queryData.queryKey,
			resolver: queryData.queryFn,
			internalRunFn: () => innerRun(queryData.queryFn),
			config: {
				...defaultEuropaQueryConfig,
				...queryData.config
			}
		};

		let data = $state<$Output | undefined>();
		let isLoading = $state(false);
		let error = $state<Error | undefined>();

		$effect(() => {
			const run = async () => {
				isLoading = true;
				const result = await this.cache.getOrSetForKey(_def.key.toString(), _def.internalRunFn);
				data = result.data;
				error = result.error;
				isLoading = false;
			};

			if (_def.config.refetchOnMount) {
				run();
			}

			return () => {
				if (_def.config.refetchOnNavigate) {
					this.cache.flushForKey(_def.key.toString());
				}
			};
		});

		const refetch = async () => {
			isLoading = true;
			this.cache.flushForKey(_def.key.toString());

			const allQueries = this.findQueriesByKey(_def.key);
			await this.rerunQueries(allQueries);

			isLoading = false;
		};

		const newQuery: EuropaQuery<$Output, $Key> = {
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

// some things todo:
// - make a europaQueryOptions object so that you can reuse that to make multiple queries with the same options
// - add states to the query, the entire thing should probably just be a state machine
