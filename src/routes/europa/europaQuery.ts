export type EuropaQueryOptions = {
	refetchOnWindowFocus: boolean;
	refetchOnMount: boolean;
	refetchOnNavigate: boolean;
};

export const defaultEuropaQueryOptions: EuropaQueryOptions = {
	refetchOnWindowFocus: true,
	refetchOnMount: true,
	refetchOnNavigate: true
};

export type InternalEuropaQueryRunFn<TOutput> = () => Promise<{
	data: TOutput | undefined;
	error: Error | undefined;
}>;

export type AnyInternalEuropaQueryRunFn = InternalEuropaQueryRunFn<any>;

export type EuropaQueryDef<TOutput> = {
	$types: {
		output: TOutput;
	};
	key: string[];
	resolver: () => Promise<TOutput>;
	options: EuropaQueryOptions;
	internalRunFn: InternalEuropaQueryRunFn<TOutput>;
};

export type EuropaQueryMethods<TOutput> = {
	data: TOutput | undefined;
	isLoading: boolean;
	refetch: () => Promise<void>;
	error: Error | undefined;
};

export type EuropaQuery<TOutput> = {
	_def: EuropaQueryDef<TOutput>;
} & EuropaQueryMethods<TOutput>;

export type AnyEuropaQuery = EuropaQuery<any>;
