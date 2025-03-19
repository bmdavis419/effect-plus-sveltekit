export type EuropaQueryConfig = {
	refetchOnWindowFocus: boolean;
	refetchOnMount: boolean;
	refetchOnNavigate: boolean;
};

export const defaultEuropaQueryConfig: EuropaQueryConfig = {
	refetchOnWindowFocus: true,
	refetchOnMount: true,
	refetchOnNavigate: true
};

export type InternalEuropaQueryRunFn<TOutput> = () => Promise<{
	data: TOutput | undefined;
	error: Error | undefined;
}>;

export type AnyInternalEuropaQueryRunFn = InternalEuropaQueryRunFn<any>;

export type EuropaQueryKey<TKey extends ReadonlyArray<any>> = {
	[K in keyof TKey]: TKey[K] extends TKey[number] ? TKey[K] : never;
};

export type EuropaQueryDef<TOutput, TKey extends ReadonlyArray<any>> = {
	$types: {
		output: TOutput;
		key: EuropaQueryKey<TKey>;
	};
	key: TKey;
	resolver: () => Promise<TOutput>;
	config: EuropaQueryConfig;
	internalRunFn: InternalEuropaQueryRunFn<TOutput>;
};

export type EuropaQueryMethods<TOutput> = {
	data: TOutput | undefined;
	isLoading: boolean;
	refetch: () => Promise<void>;
	error: Error | undefined;
};

export type EuropaQuery<TOutput, TKey extends ReadonlyArray<string>> = {
	_def: EuropaQueryDef<TOutput, TKey>;
} & EuropaQueryMethods<TOutput>;

export type AnyEuropaQuery = EuropaQuery<any, any>;

export type EuropaQueryOptions<$Output, $Key extends ReadonlyArray<any>> = {
	queryFn: () => Promise<$Output>;
	queryKey: $Key;
	config?: Partial<EuropaQueryConfig>;
};

export const europaQueryOptions = <$Output, $Key extends ReadonlyArray<any>>(
	options: EuropaQueryOptions<$Output, $Key>
) => {
	return options;
};
