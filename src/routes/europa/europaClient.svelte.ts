import { getContext, setContext } from 'svelte';

class EuropaClient {
	private queries = [];

	constructor() {
		$effect(() => {
			console.log('the amongus imposter has vented');
		});
	}

	// todo: create a europa query and add it to the list while tracking everything

	testWeirdStateStuff() {
		let demoState = $state(0);

		$effect(() => {
			const lul = setInterval(() => {
				demoState = demoState + 1;
			}, 1000);

			return () => {
				clearInterval(lul);
			};
		});

		return {
			get value() {
				return demoState;
			},
			set value(newVal) {
				demoState = newVal;
			}
		};
	}
}

const DEFAULT_KEY = '$_europa_client';

export const createEuropaClient = (key: string = DEFAULT_KEY) => {
	const client = new EuropaClient();

	return setContext(key, client);
};

export const getEuropaClient = (key: string = DEFAULT_KEY) => {
	return getContext<EuropaClient>(key);
};
