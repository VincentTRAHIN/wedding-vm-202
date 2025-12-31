<script lang="ts">
	export let guestName: string;
	export let guests: { full_name: string; rsvp_status: string }[] = [];

	const hasPresent = guests.some((g) => g.rsvp_status === 'present');
</script>

<div class="bg-[#FAF9F6] font-serif p-8 text-[#1a1a1a]">
	<div
		class="max-w-xl mx-auto bg-white rounded-lg shadow-sm border border-[#e5e5e5] overflow-hidden"
	>
		<div class="bg-[#5E7E66] px-8 py-5 text-white">
			<div class="text-sm opacity-90">Mariage de</div>
			<div class="text-2xl font-bold">Vincent & Mélanie</div>
			<div class="text-sm opacity-90 mt-1">Confirmation de réponse</div>
		</div>

		<div class="p-8">
			<p class="mb-4 text-lg">C'est noté, {guestName} !</p>

			<p class="mb-6 text-gray-700">Ta réponse est bien enregistrée. Merci !</p>

			<div class="rounded-md border border-[#e5e5e5] bg-[#f3f4f6] p-6 mb-6">
				<h2 class="text-lg font-semibold mb-4 border-b border-[#e5e5e5] pb-2">Récapitulatif</h2>
				<ul class="space-y-2">
					{#each guests as guest, i (i)}
						<li class="flex justify-between items-center">
							<span class="font-medium">{guest.full_name}</span>
							{#if guest.rsvp_status === 'present'}
								<span class="text-[#5E7E66] font-bold">Présent</span>
							{:else}
								<span class="text-red-600 font-semibold">Absent</span>
							{/if}
						</li>
					{/each}
				</ul>
			</div>

			{#if hasPresent}
				<p class="text-center text-gray-600 mt-8">
					Quel bonheur ! On a hâte de fêter ça avec toi le 18 juillet.
				</p>
			{:else}
				<p class="text-center text-gray-600 mt-8">Merci encore pour ta réponse. On t'embrasse !</p>
			{/if}
		</div>
	</div>
</div>
