import { Context, Data, Effect, Layer, Schema } from 'effect';
import { Redis as UpstashRedis } from '@upstash/redis';
import { env } from '$env/dynamic/private';

class RedisError extends Data.TaggedError('RedisError')<{
	cause?: unknown;
	message?: string;
}> {}

interface RedisImpl {
	use: <T>(fn: (client: UpstashRedis) => T) => Effect.Effect<Awaited<T>, RedisError, never>;
}
export class MyRedis extends Context.Tag('Redis')<MyRedis, RedisImpl>() {}

const make = () =>
	Effect.gen(function* () {
		const url = env.UPSTASH_REDIS_REST_URL;
		const token = env.UPSTASH_REDIS_REST_TOKEN;

		const client = new UpstashRedis({
			url,
			token,
			automaticDeserialization: false
		});

		return MyRedis.of({
			use: (fn) =>
				Effect.gen(function* () {
					const result = yield* Effect.try({
						try: () => fn(client),
						catch: (e) =>
							new RedisError({
								cause: e,
								message: 'Syncronous error in `Redis.use`'
							})
					});
					if (result instanceof Promise) {
						return yield* Effect.tryPromise({
							try: () => result,
							catch: (e) =>
								new RedisError({
									cause: e,
									message: 'Asyncronous error in `Redis.use`'
								})
						});
					} else {
						return result;
					}
				})
		});
	});

const ShortLinkSchema = Schema.parseJson(
	Schema.Struct({
		slug: Schema.String,
		destination: Schema.String,
		createdAt: Schema.Date
	})
);
type ShortLinkSchema = Schema.Schema.Type<typeof ShortLinkSchema>;

export const redisLayer = Layer.scoped(MyRedis, make());

export const redisCreateShortLink = (slug: string, destination: string) =>
	Effect.gen(function* () {
		const redis = yield* MyRedis;

		const encodedData = yield* Schema.encode(ShortLinkSchema)({
			slug,
			destination,
			createdAt: new Date()
		});

		yield* Effect.logInfo(encodedData);

		return yield* redis.use((client) => client.set(slug, encodedData));
	});

export const redisGetShortLink = (slug: string) =>
	Effect.gen(function* () {
		const redis = yield* MyRedis;

		const link = yield* redis.use((client) => client.get<string>(slug));

		if (!link) return null;

		const decodedLink = yield* Schema.decode(ShortLinkSchema)(link);

		return decodedLink;
	});
