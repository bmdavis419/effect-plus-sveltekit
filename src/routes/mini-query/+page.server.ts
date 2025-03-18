import { Schema } from 'effect';
import { createBuilder } from './queryBuilder';
import { createRouterBuilder } from './routerBuilder';

const routerBuilder = createRouterBuilder();

const queries = routerBuilder({
	hello: createBuilder()
		.input(Schema.asSchema(Schema.String))
		.output(Schema.asSchema(Schema.String))
		.resolver(async (data) => {
			return `Hello ${data.input}`;
		})
});

export const load = async () => {
	const result = await queries.hello.resolver({
		input: 'B E A N'
	});

	console.log(result);

	return {
		result
	};
};
