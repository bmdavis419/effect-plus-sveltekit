import { json } from '@sveltejs/kit';

export const GET = async (event) => {
	return json({ shut: 'up' });
};
