import { Effect } from 'effect';

type MetisQueryKey = ReadonlyArray<unknown>;

export type DecoratedMetisQueryKey<TKey extends MetisQueryKey> = {
	[K in keyof TKey]: TKey[K] extends TKey[number] ? TKey[K] : never;
};

export type MetisQueryResolver<TKey extends MetisQueryKey, TOutput, TError> = (
	input: DecoratedMetisQueryKey<TKey>
) => Effect.Effect<TOutput, TError>;

export type MetisQueryDef<TKey extends MetisQueryKey, TOutput, TError> = {
	resolver: MetisQueryResolver<TKey, TOutput, TError>;
	$types: {
		output: TOutput;
		key: DecoratedMetisQueryKey<TKey>;
		error: TError;
	};
	key: DecoratedMetisQueryKey<TKey>;
	internalRunResolver: () => Promise<{
		data: TOutput | undefined;
		error: TError | undefined;
	}>;
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

export type MetisQueryOptions<$Key extends MetisQueryKey, $Output, $Error> = {
	queryFn: MetisQueryResolver<$Key, $Output, $Error>;
	queryKey: $Key;
};

export const metisQueryOptions = <$Key extends MetisQueryKey, $Output, $Error>(
	options: MetisQueryOptions<$Key, $Output, $Error>
) => {
	return options;
};

export const createMetisQuery = <$Key extends MetisQueryKey, $Output, $Error>(
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
			}
		};

		$effect(() => {
			this.refetch();
		});
	}

	async refetch() {
		this.isLoading = true;

		const { data, error } = await this._def.internalRunResolver();

		this.data = data;
		this.error = error;
		this.isLoading = false;
	}
}
