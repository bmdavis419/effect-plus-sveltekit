export type EuropaQueryOptions = {
	refetchOnWindowFocus: boolean;
	refetchOnMount: boolean;
};

export const defaultEuropaQueryOptions: EuropaQueryOptions = {
	refetchOnWindowFocus: true,
	refetchOnMount: true
};

export type EuropaQueryDef<TOutput> = {
	$types: {
		output: TOutput;
	};
	key: string[];
	resolver: () => Promise<TOutput>;
	options: EuropaQueryOptions;
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
