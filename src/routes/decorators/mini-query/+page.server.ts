import { Schema } from 'effect';
import { createBuilder } from './queryBuilder';

export const load = async () => {
	const builderStart = createBuilder();

	console.log(builderStart);

	const testingInputSchema = Schema.asSchema(
		Schema.Struct({
			name: Schema.String,
			age: Schema.Number
		})
	);

	const nextStep = builderStart.input(testingInputSchema);

	console.log(nextStep);

	const anotherOne = nextStep.resolver((data) => {
		console.log(data.input.age);

		return `Hello ${data.input.name}`;
	});

	console.log('big man', anotherOne);

	const result = await anotherOne.resolver({
		input: {
			name: 'bean',
			age: 22
		}
	});

	console.log(result);

	return {
		among: 'us'
	};
};
