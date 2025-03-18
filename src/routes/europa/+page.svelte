<script>
	import { getEuropaClient } from './europaClient.svelte.js';
	import { createEuropaQuery } from './europaQuery.js';

	const { data } = $props();

	$inspect(data);

	const client = getEuropaClient();

	// THIS DOES NOT WORK IF DESTRUCTURED
	let weirdObjMan = client.testWeirdStateStuff();

	$inspect(weirdObjMan.value);
</script>

<div>we making shitty react query at home</div>

<div>
	{weirdObjMan.value}
</div>

<button onclick={() => (weirdObjMan.value = weirdObjMan.value + 1)}> click me </button>
