import { myMiniRouter } from './decoratorsSandbox';

export const load = () => {
	type NeededInput = typeof myMiniRouter.hello._def.$types.input;

	const res = myMiniRouter.hello.resolver({
		input: {
			name: 'Bean',
			age: 22
		}
	});

	return res;
};
