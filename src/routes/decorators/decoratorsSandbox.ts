type MiniQueryDef = {
	input: unknown;
	output: unknown;
};

type MiniQueryOpts<TInput> = {
	input: TInput;
};

type MiniQuery<TDef extends MiniQueryDef> = {
	_def: {
		$types: TDef;
	};
	resolver(opts: MiniQueryOpts<TDef['input']>): TDef['output'];
};

type AnyMiniQuery = MiniQuery<any>;

type MiniQueryRecord = {
	[key: string]: AnyMiniQuery;
};

type DecoratedMiniQueryRecord<TRecord extends MiniQueryRecord> = {
	[TKey in keyof TRecord]: TRecord[TKey] extends MiniQuery<infer TDef> ? MiniQuery<TDef> : never;
};

interface HelloQueryDef extends MiniQueryDef {
	input: {
		name: string;
		age: number;
	};
	output: {
		message: string;
	};
}

const testMiniQuery: MiniQuery<HelloQueryDef> = {
	_def: {} as any,
	resolver: (opts) => {
		return {
			message: `Hello ${opts.input.name}, you are ${opts.input.age} years old`
		};
	}
};

const testMiniRouter = {
	hello: testMiniQuery,
	goodbye: testMiniQuery
} as const;

export const myMiniRouter = testMiniRouter as DecoratedMiniQueryRecord<typeof testMiniRouter>;

// probably break this file up and make promises work
