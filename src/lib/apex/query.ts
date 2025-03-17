import type { RequestEvent } from '@sveltejs/kit';
import { Schema } from 'effect';
import type { ApexQuery, ApexQueryDefinition } from './types';

type TypedRoute = {
	route: ApexQuery<any, any>;
	types: {
		input: unknown;
		output: unknown;
	};
};

export const createApexRouter = () => {
	const routes = new Map<string, TypedRoute>();

	const addRoute = <I, O>(route: ApexQuery<I, O>) => {
		routes.set(route.id, {
			route,
			types: route._types
		});
	};

	const getRoute = <I = unknown, O = unknown>(id: string) => {
		const entry = routes.get(id);

		if (!entry) {
			throw new Error(`Route with id ${id} not found`);
		}

		return entry.route as ApexQuery<
			I extends unknown ? typeof entry.types.input : I,
			O extends unknown ? typeof entry.types.output : O
		>;
	};

	return {
		addRoute,
		getRoute
	} as const;
};

export const createApexQuery = () => {
	const input = <I>(schema: Schema.SchemaClass<I, string, never>) => {
		type InputType = Schema.Schema.Type<typeof schema>;

		const query = <O>(
			fn: (data: { input: InputType; request: RequestEvent }) => O
		): {
			def: ApexQueryDefinition<InputType, O>;
			query: ApexQuery<InputType, O>;
		} => {
			type OutputType = O;

			const id = crypto.randomUUID();

			const query: ApexQuery<InputType, OutputType> = {
				id,
				schema,
				query: fn,
				_types: {} as { input: InputType; output: OutputType }
			};

			const def: ApexQueryDefinition<InputType, OutputType> = {
				id,
				schema,
				_types: {} as { input: InputType; output: OutputType }
			};

			return { def, query };
		};

		return {
			query
		};
	};

	return {
		input
	};
};
