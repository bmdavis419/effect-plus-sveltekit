import { getContext, setContext } from 'svelte';
import {
	defaultEuropaQueryOptions,
	type AnyEuropaQuery,
	type EuropaQuery,
	type EuropaQueryDef,
	type EuropaQueryOptions
} from './europaQuery';
import {
	defaultEuropaMutationOptions,
	type EuropaMutation,
	type EuropaMutationDef,
	type EuropaMutationOptions
} from './europaMutation';

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

	createQuery<$Output>(queryData: {
		queryFn: () => Promise<$Output>;
		queryKey: string[];
		options?: Partial<EuropaQueryOptions>;
	}): EuropaQuery<$Output> {
		const _def: EuropaQueryDef<$Output> = {
			$types: { output: null as unknown as $Output },
			key: queryData.queryKey,
			resolver: queryData.queryFn,
			options: {
				...defaultEuropaQueryOptions,
				...queryData.options
			}
		};

		let data = $state<$Output | undefined>();
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

		const newQuery: EuropaQuery<$Output> = {
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
