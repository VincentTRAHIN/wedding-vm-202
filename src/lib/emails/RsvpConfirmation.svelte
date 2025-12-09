<script lang="ts">
	export let guestName: string;
	export let guests: { full_name: string; rsvp_status: string }[] = [];
</script>

<div class="bg-[#FAF9F6] font-serif p-8 text-[#1a1a1a]">
	<div class="max-w-xl mx-auto bg-white p-8 rounded-lg shadow-sm border border-[#e5e5e5]">
		<h1 class="text-2xl font-bold text-[#5E7E66] mb-6 text-center">Vincent & Mélanie</h1>

		<p class="mb-4 text-lg">C'est noté {guestName} !</p>

		<p class="mb-6 text-gray-700">
			Votre réponse est bien enregistrée. Nous sommes ravis de recevoir votre confirmation.
		</p>

		<div class="bg-[#f3f4f6] p-6 rounded-md mb-6">
			<h2 class="text-lg font-semibold mb-4 border-b border-gray-300 pb-2">Récapitulatif</h2>
			<ul class="space-y-2">
				{#each guests as guest}
					<li class="flex justify-between items-center">
						<span class="font-medium">{guest.full_name}</span>
						{#if guest.rsvp_status === 'present'}
							<span class="text-[#5E7E66] font-bold">Présent</span>
						{:else}
							<span class="text-red-500">Absent</span>
						{/if}
					</li>
				{/each}
			</ul>
		</div>

		<p class="text-center text-gray-600 mt-8">Hâte de vous voir le 18 juillet.</p>
	</div>
</div>
