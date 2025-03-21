<script>
	import TestQuery from '../TestQuery.svelte';
</script>

<div>this is a sub page</div>
<a href="/metis" class="text-blue-500 underline">go back</a>

<div class="flex items-center justify-center gap-4">
	<TestQuery idx={1} />
	<TestQuery idx={2} />
	<TestQuery idx={3} />
</div>
