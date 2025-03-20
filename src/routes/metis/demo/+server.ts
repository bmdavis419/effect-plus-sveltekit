import { error, json } from '@sveltejs/kit';

export const GET = () => {
	const randomNumber = Math.random();

	if (randomNumber < 0.5) {
		return json({ randomNumber });
	} else {
		return error(500, 'sorry, your number is too big :(');
	}
};
