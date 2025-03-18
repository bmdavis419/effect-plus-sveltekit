import { Schema } from 'effect';
import { myMiniRouter } from './decoratorsSandbox';

const testSchema = Schema.Struct({
	name: Schema.String,
	age: Schema.Number
});

const testing = Schema.asSchema(testSchema);

const decoder = Schema.decodeUnknownSync(testSchema);

export const load = () => {
	type NeededInput = typeof myMiniRouter.hello._def.$types.input;

	const res = myMiniRouter.hello.resolver({
		input: {
			name: 'Bean',
			age: 22
		}
	});

	const test = decoder({
		name: 'Bean',
		age: 22
	});

	console.log(test);

	return res;
};
