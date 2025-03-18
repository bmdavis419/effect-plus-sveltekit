import { getParseFn, type InferParser, type Parser } from './parser';
import type {
	AnyMiniQuery,
	DefaultValue,
	MiniQuery,
	MiniQueryOpts,
	MiniQueryResolver,
	UnsetMarker
} from './types';

interface QueryBuilder<TInputIn, TInputOut, TOutputIn, TOutputOut> {
	_def: QueryBuilderDef;
	input<$Parser extends Parser>(
		schema: $Parser
	): QueryBuilder<
		InferParser<$Parser>['input'],
		InferParser<$Parser>['output'],
		TOutputIn,
		TOutputOut
	>;
	output<$Parser extends Parser>(
		schema: $Parser
	): QueryBuilder<
		TInputIn,
		TInputOut,
		InferParser<$Parser>['input'],
		InferParser<$Parser>['output']
	>;
	resolver<$Output>(resolver: MiniQueryResolver<TInputOut, TOutputIn, $Output>): MiniQuery<{
		input: DefaultValue<TInputIn, void>;
		output: DefaultValue<TOutputOut, $Output>;
	}>;
}

type AnyQueryBuilder = QueryBuilder<any, any, any, any>;

type QueryBuilderResolver = MiniQueryResolver<any, any, any>;

type QueryBuilderDef = {
	input?: Parser;
	output?: Parser;
	resolver?: QueryBuilderResolver;
};

const createNewBuilder = (data: { def1: QueryBuilderDef; def2: QueryBuilderDef }) => {
	return createBuilder({
		...data.def1,
		...data.def2
	});
};

export const createBuilder = (
	initDef: QueryBuilderDef = {}
): QueryBuilder<UnsetMarker, UnsetMarker, UnsetMarker, UnsetMarker> => {
	const _def = initDef;

	const builder: AnyQueryBuilder = {
		_def,
		input(input) {
			return createNewBuilder({
				def1: _def,
				def2: {
					input
				}
			});
		},
		output(output) {
			return createNewBuilder({
				def1: _def,
				def2: {
					output
				}
			});
		},
		resolver(resolver) {
			return createResolver({
				defIn: _def,
				resolver
			});
		}
	};

	return builder;
};

const createResolver = (data: {
	defIn: QueryBuilderDef;
	resolver: QueryBuilderResolver;
}): AnyMiniQuery => {
	if (!data.defIn.input) {
		throw new Error('Input is required');
	}

	const finalBuilder = createNewBuilder({
		def1: data.defIn,
		def2: {
			resolver: data.resolver
		}
	});

	const _def: AnyMiniQuery['_def'] = {
		$types: null as any
	};

	const createMiniQuery = (data: {
		miniQueryDef: AnyMiniQuery['_def'];
		resolver: QueryBuilderResolver;
	}): AnyMiniQuery => {
		async function query(opts: MiniQueryOpts<unknown>) {
			const result = await data.resolver(opts);

			return result;
		}

		return {
			_def: data.miniQueryDef,
			resolver: query
		};
	};

	const miniQuery = createMiniQuery({
		miniQueryDef: _def,
		resolver: finalBuilder._def.resolver!
	});

	return miniQuery;
};
