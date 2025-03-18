import type { Schema } from 'effect';

export type MiniQueryDef = {
	input: unknown;
	output: unknown;
};

export type MiniQueryOpts<TInput> = {
	input: TInput;
};

export type MiniQueryResolver<TInput, TOutput, $Output> = (
	opts: MiniQueryOpts<TInput>
) => MaybePromise<DefaultValue<TOutput, $Output>>;

export type MiniQuery<TDef extends MiniQueryDef> = {
	_def: {
		$types: TDef;
	};
	resolver(opts: MiniQueryOpts<TDef['input']>): MaybePromise<TDef['output']>;
};

export type AnyMiniQuery = MiniQuery<any>;

export type MiniQueryRecord = {
	[key: string]: AnyMiniQuery;
};

export type DecoratedMiniQueryRecord<TRecord extends MiniQueryRecord> = {
	[TKey in keyof TRecord]: TRecord[TKey] extends MiniQuery<infer TDef> ? MiniQuery<TDef> : never;
};

export type MaybePromise<TType> = Promise<TType> | TType;

const unsetMarker = Symbol();
export type UnsetMarker = typeof unsetMarker;

export type DefaultValue<TValue, TFallback> = TValue extends UnsetMarker ? TFallback : TValue;
