import { Effect } from 'effect';

export type MetisMutationOptions<TInput, TOutput, TError> = {
	mutationFn: MetisMutationResolver<TInput, TOutput, TError>;
	onSuccess?: (data: TOutput) => Promise<void>;
	onError?: (error: TError) => Promise<void>;
};

export const defaultMetisMutationOptions: MetisMutationOptions<any, any, any> = {
	mutationFn: () => Effect.succeed(undefined)
};

export type MetisMutationResolver<TInput, TOutput, TError> = (
	input: TInput
) => Effect.Effect<TOutput, TError>;

export type MetisMutationDef<TInput, TOutput, TError> = {
	$types: {
		input: TInput;
		output: TOutput;
		error: TError;
	};
	options: MetisMutationOptions<TInput, TOutput, TError>;
	internalRunResolver: (input: TInput) => Promise<{
		data: TOutput | undefined;
		error: TError | undefined;
	}>;
};

export type MetisMutationMethods<TInput, TOutput, TError> = {
	mutate: (input: TInput) => Promise<void>;
	data: TOutput | undefined;
	error: TError | undefined;
	isLoading: boolean;
};

export type MetisMutation<TInput, TOutput, TError> = {
	_def: MetisMutationDef<TInput, TOutput, TError>;
} & MetisMutationMethods<TInput, TOutput, TError>;

export type AnyMetisMutation = MetisMutation<any, any, any>;

export const metisMutationOptions = <$Input, $Output, $Error>(
	options: MetisMutationOptions<$Input, $Output, $Error>
) => {
	return options;
};

export const createMetisMutation = <$Input, $Output, $Error>(
	options: MetisMutationOptions<$Input, $Output, $Error>
) => {
	return new MetisMutationClass(options) as MetisMutation<$Input, $Output, $Error>;
};

export class MetisMutationClass<$Input, $Output, $Error>
	implements MetisMutation<$Input, $Output, $Error>
{
	_def: MetisMutationDef<$Input, $Output, $Error>;

	data = $state<$Output | undefined>();
	error = $state<$Error | undefined>();
	isLoading = $state<boolean>(false);

	constructor(options: MetisMutationOptions<$Input, $Output, $Error>) {
		this._def = {
			$types: {
				input: null as unknown as $Input,
				output: null as unknown as $Output,
				error: null as unknown as $Error
			},
			options: options,
			internalRunResolver: async (input: $Input) => {
				try {
					const result = await Effect.runPromise(options.mutationFn(input));

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
	}

	async mutate(input: $Input) {
		this.isLoading = true;
		const { data, error } = await this._def.internalRunResolver(input);

		if (data) {
			this._def.options.onSuccess?.(data);
			this.data = data;
		}

		if (error) {
			this._def.options.onError?.(error);
			this.error = error;
		}

		this.isLoading = false;
	}
}
