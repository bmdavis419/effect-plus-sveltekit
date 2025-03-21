import { getContext, setContext } from 'svelte';
import type {
	AnyMetisQuery,
	MetisQuery,
	MetisQueryKey,
	MetisQueryOptions
} from './metisQuery.svelte';
import {
	internalCreateMetisMutation,
	type AnyMetisMutation,
	type MetisMutation,
	type MetisMutationOptions
} from './metisMutation.svelte';
import { internalCreateMetisQuery } from './metisQuery.svelte';
import { MetisQueryCache } from './metisQueryCache';

type MetisClientQueryStore = {
	query: AnyMetisQuery;
	locationPath: string;
};

type MetisClientMutationStore = {
	mutation: AnyMetisMutation;
};

class MetisClient {
	private queries: MetisClientQueryStore[] = [];
	private mutations: MetisClientMutationStore[] = [];
	private cache = new MetisQueryCache();

	private getQueryByKey(key: ReadonlyArray<any>) {
		return this.queries.find((query) => {
			const queryKey = query.query._def.key;
			return key.every((k, i) => k === queryKey[i]);
		});
	}

	private handleWindowFocus() {
		const isVisible = !document.hidden;

		if (isVisible) {
			console.log('we are on', window.location.pathname);
			console.log('we visited the page');
		}
	}

	constructor() {
		$effect(() => {
			const boundHandler = () => this.handleWindowFocus();
			document.addEventListener('visibilitychange', boundHandler);
			return () => {
				document.removeEventListener('visibilitychange', boundHandler);
			};
		});
	}

	createQuery<$Key extends MetisQueryKey, $Output, $Error>(
		options: MetisQueryOptions<$Key, $Output, $Error>
	): MetisQuery<$Key, $Output, $Error> {
		const query = internalCreateMetisQuery({
			...options,
			cache: this.cache
		});
		$effect(() => {
			// have to do this client side
			this.queries.push({ query, locationPath: window.location.pathname });
		});
		return query;
	}

	createMutation<$Input, $Output, $Error>(
		options: MetisMutationOptions<$Input, $Output, $Error>
	): MetisMutation<$Input, $Output, $Error> {
		const mutation = internalCreateMetisMutation(options);
		this.mutations.push({ mutation });
		return mutation;
	}
}

const DEFAULT_KEY = '$_metis_client';

export const createMetisClient = (key: string = DEFAULT_KEY) => {
	const client = new MetisClient();
	return setContext(key, client);
};

export const getMetisClient = (key: string = DEFAULT_KEY) => {
	return getContext<MetisClient>(key);
};
