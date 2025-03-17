interface ApexQueryDef {
	input: unknown;
	output: unknown;
}

type ApexRouterRecord = {
	[key: string]: ApexQuery<any>;
};

type DecorateQuery<TQuery extends ApexQuery<any>> = (
	input: TQuery['$types']['input']
) => Promise<TQuery['$types']['output']>;

type DecorateRouterRecord<TRecord extends ApexRouterRecord> = {
	[TKey in keyof TRecord]: TRecord[TKey] extends infer $Value
		? $Value extends ApexQuery<any>
			? DecorateQuery<$Value>
			: never
		: never;
};

export type ApexQueryCaller<TRecord extends ApexRouterRecord> = () => DecorateRouterRecord<TRecord>;

export type ApexRouter<TRecord extends ApexRouterRecord> = {
	_def: {
		queries: TRecord;
	};
	createCaller: ApexQueryCaller<TRecord>;
};

type ApexQueryOpts = {
	input: unknown;
};

export type ApexQuery<TDef extends ApexQueryDef> = {
	_defs: {};
	id: string;
	$types: {
		input: TDef['input'];
		output: TDef['output'];
	};
	caller: (opts: ApexQueryOpts) => Promise<TDef['output']>;
};

/**
 * Create an object without inheriting anything from `Object.prototype`
 * @internal
 */
export function omitPrototype<TObj extends Record<string, unknown>>(obj: TObj): TObj {
	return Object.assign(Object.create(null), obj);
}

const createApexQueryCallerFactory = () => {
	return function createCallerInner<TRecord extends ApexRouterRecord>(
		router: Pick<ApexRouter<TRecord>, '_def'>
	): ApexQueryCaller<TRecord> {
		return () => router._def.queries as DecorateRouterRecord<TRecord>;
	};
};

export type DecorateCreateApexRouterOpts<TRouterOptions extends ApexRouterRecord> = {
	[K in keyof TRouterOptions]: TRouterOptions[K] extends infer $Value
		? $Value extends ApexQuery<any>
			? $Value
			: never
		: never;
};

export const createApexRouter = <TInput extends ApexRouterRecord>(
	opts: TInput
): ApexRouter<DecorateCreateApexRouterOpts<TInput>> => {
	function addQueries(opts: ApexRouterRecord) {
		const queries: ApexRouterRecord = omitPrototype({});
		for (const [key, value] of Object.entries(opts)) {
			queries[key] = value;
		}
		return queries;
	}

	const queries = addQueries(opts);

	const _def: ApexRouter<any>['_def'] = {
		queries
	};

	const router: ApexRouter<{}> = {
		_def,
		createCaller: createApexQueryCallerFactory()({
			_def
		})
	};

	return router as ApexRouter<DecorateCreateApexRouterOpts<TInput>>;
};
