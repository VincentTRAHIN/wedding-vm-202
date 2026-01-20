<script lang="ts">
	export let data;
</script>

<div class="max-w-2xl mx-auto p-8">
	<h1 class="text-2xl font-bold mb-4">🧪 Test d'envoi d'email</h1>

	<div class="bg-gray-100 p-4 rounded mb-4">
		<p class="text-sm text-gray-600 mb-2">Timestamp: {data.timestamp}</p>
		<p class="font-semibold">
			Status: {data.result.success ? '✅ Success' : '❌ Failed'}
		</p>
	</div>

	{#if data.result.success}
		<div class="bg-green-50 border border-green-200 p-4 rounded">
			<p class="text-green-800 font-semibold mb-2">✅ Email envoyé avec succès!</p>
			<pre class="text-xs bg-white p-2 rounded overflow-auto">{JSON.stringify(
					data.result.data,
					null,
					2
				)}</pre>
		</div>
	{:else}
		<div class="bg-red-50 border border-red-200 p-4 rounded">
			<p class="text-red-800 font-semibold mb-2">❌ Échec de l'envoi</p>
			<pre class="text-xs bg-white p-2 rounded overflow-auto">{JSON.stringify(
					data.result.error,
					null,
					2
				)}</pre>
		</div>
	{/if}

	<div class="mt-6">
		<button
			onclick={() => window.location.reload()}
			class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
		>
			🔄 Renvoyer un test
		</button>
		<a href="/rsvp" class="ml-4 text-blue-500 hover:underline">← Retour RSVP</a>
	</div>
</div>
