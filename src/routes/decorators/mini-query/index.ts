export type MiniQueryDef = {
	input: unknown;
	output: unknown;
};

export type MiniQueryOpts<TInput> = {
	input: TInput;
};

export type MiniQuery<TDef extends MiniQueryDef> = {
	_def: {
		$types: TDef;
	};
	resolver(opts: MiniQueryOpts<TDef['input']>): TDef['output'];
};

export type AnyMiniQuery = MiniQuery<any>;

export type MiniQueryRecord = {
	[key: string]: AnyMiniQuery;
};

export type DecoratedMiniQueryRecord<TRecord extends MiniQueryRecord> = {
	[TKey in keyof TRecord]: TRecord[TKey] extends MiniQuery<infer TDef> ? MiniQuery<TDef> : never;
};
