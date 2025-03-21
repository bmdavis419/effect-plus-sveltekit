import { Effect } from 'effect';
import { MetisQueryCache } from './metisQueryCache.svelte';

export type MetisQueryKey = ReadonlyArray<unknown>;

export type DecoratedMetisQueryKey<TKey extends MetisQueryKey> = {
	[K in keyof TKey]: TKey[K] extends TKey[number] ? TKey[K] : never;
};

export type MetisQueryResolver<TKey extends MetisQueryKey, TOutput, TError> = (
	input: DecoratedMetisQueryKey<TKey>
) => Effect.Effect<TOutput, TError>;

export type MetisQueryInternalRunResolver<TOutput, TError> = () => Promise<{
	data: TOutput | undefined;
	error: TError | undefined;
}>;

export type AnyMetisQueryInternalRunResolver = MetisQueryInternalRunResolver<any, any>;

export type MetisQueryDef<TKey extends MetisQueryKey, TOutput, TError> = {
	resolver: MetisQueryResolver<TKey, TOutput, TError>;
	$types: {
		output: TOutput;
		key: DecoratedMetisQueryKey<TKey>;
		error: TError;
	};
	key: DecoratedMetisQueryKey<TKey>;
	internalRunResolver: MetisQueryInternalRunResolver<TOutput, TError>;
	config: MetisQueryConfig;
	cache: MetisQueryCache;
};

export type MetisQueryMethods<TOutput, TError> = {
	data: TOutput | undefined;
	isLoading: boolean;
	refetch: () => Promise<void>;
	error: TError | undefined;
};

export type MetisQuery<TKey extends MetisQueryKey, TOutput, TError> = {
	_def: MetisQueryDef<TKey, TOutput, TError>;
} & MetisQueryMethods<TOutput, TError>;

export type AnyMetisQuery = MetisQuery<any, any, any>;

export type MetisQueryConfig = {
	refetchOnWindowFocus: boolean;
	refetchOnMount: boolean;
	refetchOnNavigate: boolean;
};

export const defaultMetisQueryConfig: MetisQueryConfig = {
	refetchOnWindowFocus: true,
	refetchOnMount: true,
	refetchOnNavigate: true
};

export type MetisQueryOptions<$Key extends MetisQueryKey, $Output, $Error> = {
	queryFn: MetisQueryResolver<$Key, $Output, $Error>;
	queryKey: $Key;
	config?: Partial<MetisQueryConfig>;
	cache?: MetisQueryCache;
};

export const metisQueryOptions = <$Key extends MetisQueryKey, $Output, $Error>(
	options: MetisQueryOptions<$Key, $Output, $Error>
) => {
	return options;
};

export const internalCreateMetisQuery = <$Key extends MetisQueryKey, $Output, $Error>(
	options: MetisQueryOptions<$Key, $Output, $Error>
) => {
	return new MetisQueryClass(options) as MetisQuery<$Key, $Output, $Error>;
};

export class MetisQueryClass<$Key extends MetisQueryKey, $Output, $Error>
	implements MetisQuery<$Key, $Output, $Error>
{
	_def: MetisQueryDef<$Key, $Output, $Error>;

	data = $state<$Output | undefined>();
	isLoading = $state<boolean>(false);
	error = $state<$Error | undefined>(undefined);

	private cacheKey: string;

	constructor(options: MetisQueryOptions<$Key, $Output, $Error>) {
		this._def = {
			resolver: options.queryFn,
			$types: {
				output: null as unknown as $Output,
				key: null as unknown as DecoratedMetisQueryKey<$Key>,
				error: null as unknown as $Error
			},
			key: options.queryKey as DecoratedMetisQueryKey<$Key>,
			internalRunResolver: async () => {
				try {
					const result = await Effect.runPromise(this._def.resolver(this._def.key));

					return {
						data: result,
						error: undefined
					};
				} catch (error) {
					return {
						data: undefined,
						error: error as $Error
					};
				}
			},
			config: {
				...defaultMetisQueryConfig,
				...options.config
			},
			cache: options.cache ?? new MetisQueryCache()
		};

		this.cacheKey = this._def.key.toString();

		$effect(() => {
			if (this._def.config.refetchOnMount) {
				this.internalRefetch({ hitCache: true });
			}
			return () => {
				if (this._def.config.refetchOnNavigate) {
					this._def.cache.flushForKey(this.cacheKey);
				}
			};
		});

		$effect(() => {
			const cachedData = this._def.cache.getReactiveDataForKey(this.cacheKey);

			// TODO: add isLoading to this :/
			if (cachedData) {
				this.data = cachedData.data;
				this.error = cachedData.error;
			}
		});
	}

	private async internalRefetch(
		data: {
			hitCache: boolean;
		} = {
			hitCache: true
		}
	) {
		const { hitCache } = data;

		this.isLoading = true;

		const runFn = this._def.internalRunResolver;

		if (hitCache) {
			const { data, error } = await this._def.cache.getOrSetForKey({
				key: this.cacheKey,
				fn: runFn,
				refetchOnWindowFocus: this._def.config.refetchOnWindowFocus
			});

			this.data = data;
			this.error = error;
			this.isLoading = false;
		} else {
			const { data, error } = await runFn();

			this._def.cache.setReactiveDataForKey(this.cacheKey, {
				data,
				error
			});

			this.data = data;
			this.error = error;
			this.isLoading = false;
		}
	}

	async refetch() {
		await this.internalRefetch({ hitCache: false });
	}
}
