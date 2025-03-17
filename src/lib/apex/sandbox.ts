import { Effect, Schema } from 'effect';
import { mergeWithoutOverrides, type UnsetMarker } from './utils';

interface ApexQueryDef {
	input: unknown;
	output: unknown;
}

type ApexRouterRecord = {
	[key: string]: AnyApexQuery;
};

type DecorateQuery<TQuery extends AnyApexQuery> = (
	input: TQuery['_defs']['$types']['input']
) => Promise<TQuery['_defs']['$types']['output']>;

type DecorateRouterRecord<TRecord extends ApexRouterRecord> = {
	[TKey in keyof TRecord]: TRecord[TKey] extends infer $Value
		? $Value extends AnyApexQuery
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
	_defs: {
		$types: {
			input: TDef['input'];
			output: TDef['output'];
		};
		id: string;
	};

	(opts: ApexQueryOpts): Promise<TDef['output']>;
};

type AnyApexQuery = ApexQuery<any>;

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
		? $Value extends AnyApexQuery
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

const testSchema = Schema.Struct({
	name: Schema.String,
	age: Schema.Number
});

type InputType = Schema.Schema.Type<typeof testSchema>;

const parseFnTest = async (input: string) => {
	const result = await Effect.runPromise(
		Effect.gen(function* () {
			const schemaJson = Schema.parseJson(testSchema);
			const decoded = yield* Schema.decode(schemaJson)(input);
			return decoded;
		})
	);

	return result;
};

export type ParseFn<TType> = (input: string) => Promise<TType>;

function getParseFn<TType>(procedureParser: Schema.SchemaClass<TType, string>): ParseFn<TType> {
	return async (input: string) => {
		const result = await Effect.runPromise(
			Effect.gen(function* () {
				const decoded = yield* Schema.decode(procedureParser)(input);
				return decoded;
			})
		);

		return result;
	};
}

type ParserWithOutput<TOutput> = Schema.SchemaClass<TOutput, string>;

type Parser = ParserWithOutput<any>;

type InferParser<TParser extends Parser> =
	TParser extends ParserWithOutput<infer $TOut>
		? {
				out: $TOut;
			}
		: never;

export type Simplify<TType> = TType extends any[] | Date ? TType : { [K in keyof TType]: TType[K] };

type IntersectIfDefined<TType, TWith> = TType extends UnsetMarker
	? TWith
	: TWith extends UnsetMarker
		? TType
		: Simplify<TType & TWith>;

type QueryResolverOpts<TInputOut> = {
	input: TInputOut;
};

type QueryResolver<TInputOut, $Output> = (opts: QueryResolverOpts<TInputOut>) => $Output;

type QueryBuilderResolver = (opts: QueryResolverOpts<any>) => any;

export interface ApexQueryBuilder<TInputIn, TInputOut, TOutput> {
	input<$Parser extends Parser>(
		schema: $Parser
	): ApexQueryBuilder<
		IntersectIfDefined<TInputIn, string>,
		IntersectIfDefined<TInputOut, InferParser<$Parser>['out']>,
		TOutput
	>;
	query<$Output>(resolver: QueryResolver<TInputOut, $Output>): ApexQuery<{
		input: TInputIn;
		output: $Output;
	}>;
}

type AnyApexQueryBuilder = ApexQueryBuilder<any, any, any>;

type ApexQueryBuilderDef = {
	parseFn?: ParseFn<any>;
	resolver?: QueryBuilderResolver;
};

const createNewApexQueryBuilder = (data: {
	def1: ApexQueryBuilderDef;
	def2: Partial<ApexQueryBuilderDef>;
}) => {
	const { def1, def2 } = data;

	return createApexQueryBuilder({
		...mergeWithoutOverrides(def1, def2)
	});
};

export const createApexQueryBuilder = (initDef: Partial<ApexQueryBuilderDef>) => {
	const _def: ApexQueryBuilderDef = {
		...initDef
	};

	const builder: AnyApexQueryBuilder = {
		input(input) {
			const parser = getParseFn(input);
			return createNewApexQueryBuilder({
				def1: _def,
				def2: {
					parseFn: parser
				}
			});
		},
		query(resolver) {
			return createResolver({
				resolver,
				parseFn: _def.parseFn!
			});
		}
	};

	return builder;
};

const createResolver = (data: { resolver: QueryBuilderResolver; parseFn: ParseFn<any> }) => {
	const { resolver, parseFn } = data;

	const id = crypto.randomUUID();

	const _def: AnyApexQuery['_defs'] = {
		$types: null as any,
		id
	};

	return createQueryCaller({
		_def,
		resolver,
		parseFn
	});
};

function createQueryCaller(data: {
	_def: AnyApexQuery['_defs'];
	resolver: QueryBuilderResolver;
	parseFn: ParseFn<any>;
}): AnyApexQuery {
	const { _def, resolver, parseFn } = data;

	async function procedure(opts: ApexQueryOpts) {
		const parsed = await parseFn(opts.input as string);
		const result = resolver({
			input: parsed
		});

		return result;
	}

	procedure._defs = _def;

	return procedure;
}

const builder = createApexQueryBuilder({});

const query = builder.input(Schema.parseJson(testSchema));

// TODO: keep working on getting the query builder to work. Start by testing console logging the current states of the builder
