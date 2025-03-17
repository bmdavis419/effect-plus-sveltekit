type MiniQueryDef = {
	input: unknown;
	output: unknown;
};

type MiniQueryOpts<TInput> = {
	input: TInput;
};

type MiniQuery<TDef extends MiniQueryDef> = {
	_def: {
		$types: {
			input: TDef['input'];
			output: TDef['output'];
		};
	};
	(opts: MiniQueryOpts<TDef['input']>): TDef['output'];
};

type AnyMiniQuery = MiniQuery<any>;

type MiniRouterRecord = {
	[key: string]: AnyMiniQuery;
};

type DecoratedMiniQuery<TDef extends MiniQueryDef> = {};

type DecoratedMiniRouterRecord<TRecord extends MiniRouterRecord> = {
	[TKey in keyof TRecord]: TRecord[TKey] extends infer $Value
		? $Value extends AnyMiniQuery
			? MiniQuery<$Value['_def']['$types']>
			: never
		: never;
};
