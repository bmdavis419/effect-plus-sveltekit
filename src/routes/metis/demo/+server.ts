import { error, json } from '@sveltejs/kit';

export const GET = async () => {
	const randomNumber = Math.random();

	await new Promise((resolve) => setTimeout(resolve, 1400));

	if (randomNumber < 0.5) {
		return json({ randomNumber });
	} else {
		return error(500, 'sorry, your number is too big :(');
	}
};
