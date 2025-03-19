import { getEuropaClient } from './europaClient.svelte.js';

export const createFirstQuery = () => {
	const client = getEuropaClient();

	return client.createQuery({
		queryFn: async () => {
			console.log('big boy got run');
			const randomNumber = Math.random();
			await new Promise((resolve) => setTimeout(resolve, 2000));

			// if (randomNumber > 0.5) {
			// 	throw new Error('random number is too big');
			// }

			return randomNumber;
		},
		queryKey: [420, 'sus'] as const,
		options: {
			refetchOnNavigate: false
		}
	});
};
