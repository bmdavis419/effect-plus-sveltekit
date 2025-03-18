export type EuropaMutationOptions<TOutput> = {
	onSuccess?: (data: TOutput) => Promise<void>;
	onError?: (error: Error) => Promise<void>;
};

export const defaultEuropaMutationOptions: EuropaMutationOptions<any> = {};

export type EuropaMutationDef<TInput, TOutput> = {
	$types: {
		input: TInput;
		output: TOutput;
	};
	resolver: (input: TInput) => Promise<TOutput>;
	options: EuropaMutationOptions<TOutput>;
};

export type EuropaMutationMethods<TInput, TOutput> = {
	mutate: (input: TInput) => Promise<void>;
	data: TOutput | undefined;
	isLoading: boolean;
	error: Error | undefined;
};

export type EuropaMutation<TInput, TOutput> = {
	_def: EuropaMutationDef<TInput, TOutput>;
} & EuropaMutationMethods<TInput, TOutput>;

export type AnyEuropaMutation = EuropaMutation<any, any>;
