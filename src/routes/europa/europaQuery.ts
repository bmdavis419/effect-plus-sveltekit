export type EuropaQueryDef<TOutput> = {
	$types: {
		output: TOutput;
	};
	key: string[];
	resolver: (...args: any[]) => Promise<TOutput>;
};

export type EuropaQueryMethods<TOutput> = {
	data: TOutput | undefined;
	isLoading: boolean;
};

export type EuropaQuery<TOutput> = {
	_def: EuropaQueryDef<TOutput>;
} & EuropaQueryMethods<TOutput>;

export const createEuropaQuery = <TOutput>(data: {
	queryFn: (...args: any[]) => Promise<TOutput>;
	queryKey: string[];
}): EuropaQuery<TOutput> => {
	return {
		_def: {
			$types: { output: undefined as unknown as TOutput },
			key: data.queryKey,
			resolver: data.queryFn
		},
		data: undefined,
		isLoading: false
	};
};
