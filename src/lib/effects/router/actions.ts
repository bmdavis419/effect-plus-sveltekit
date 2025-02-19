import { Effect } from 'effect';
import { redisCreateShortLink } from '../redis';

export const actionHomeCreate = Effect.gen(function* () {
	yield* redisCreateShortLink('test', 'https://www.google.com');

	return {
		success: true
	};
});
