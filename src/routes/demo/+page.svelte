<script lang="ts">
	const fakeBody = {
		name: 'Bean',
		age: 22
	};

	const handleSubmit = async () => {
		const result = await fetch('?/actionDemo', {
			method: 'POST',
			body: JSON.stringify(fakeBody)
		});

		const data = await result.json();

		console.log(data);
	};
</script>

<div class="flex flex-col gap-4">
	<h1>Demo</h1>

	<button onclick={handleSubmit} class="rounded-md bg-blue-500 p-2 text-white"> test send </button>
</div>
