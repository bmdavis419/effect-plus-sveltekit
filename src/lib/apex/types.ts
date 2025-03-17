import type { RequestEvent } from '@sveltejs/kit';
import type { Schema } from 'effect';
import type { UnsetMarker } from './utils';

export type ApexQuery<I, O> = {
	query: (data: { input: I; request: RequestEvent }) => O;
	id: string;
	schema: Schema.SchemaClass<I, string, never>;
	_types: {
		input: I;
		output: O;
	};
};

export type ApexQueryDefinition<I, O> = {
	id: string;
	schema: Schema.SchemaClass<I, string, never>;
	_types: {
		input: I;
		output: O;
	};
};

export type DefaultValue<TValue, TFallback> = TValue extends UnsetMarker ? TFallback : TValue;
