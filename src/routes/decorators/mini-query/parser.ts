import { Schema } from 'effect';
import type { MaybePromise } from './types';

type ParserEffectSchema<TInput, TOutput> = Schema.Schema<TInput, TOutput, never>;

export type Parser = ParserEffectSchema<any, any>;

export type InferParser<TParser extends Parser> =
	TParser extends ParserEffectSchema<infer $TIn, infer $TOut>
		? {
				input: $TIn;
				output: $TOut;
			}
		: never;

export type ParseFn<TType> = (value: unknown) => MaybePromise<TType>;

export function getParseFn<TType>(queryParser: Parser): ParseFn<TType> {
	// note: this can throw, maybe do some error handling later if I figure all of this shit out lol
	return (value: unknown) => Schema.decodeUnknownSync(queryParser)(value) as TType;
}
