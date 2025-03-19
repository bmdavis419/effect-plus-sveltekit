import { getEuropaClient } from './europaClient.svelte.js';
import { europaQueryOptions } from './europaQuery.js';

export const createFirstQuery = () => {
	const client = getEuropaClient();

	const options = europaQueryOptions({
		queryFn: async () => {
			console.log('big boy got run');
			const randomNumber = Math.random();
			await new Promise((resolve) => setTimeout(resolve, 200));

			return randomNumber;
		},
		queryKey: [420, 'sus'] as const,
		config: {
			refetchOnNavigate: false
		}
	});

	return client.createQuery(options);
};
