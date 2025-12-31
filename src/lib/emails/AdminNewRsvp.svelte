<script lang="ts">
	export let mainGuestName: string;
	export let status: string;
	export let guests: { full_name: string; rsvp_status: string }[] = [];
</script>

<div class="bg-[#FAF9F6] font-serif p-8 text-[#1a1a1a]">
	<div
		class="max-w-xl mx-auto bg-white rounded-lg shadow-sm border border-[#e5e5e5] overflow-hidden"
	>
		<div class="bg-[#5E7E66] px-8 py-5 text-white">
			<div class="text-sm opacity-90">Mariage de</div>
			<div class="text-2xl font-bold">Vincent & Mélanie</div>
		</div>

		<div class="p-8">
			<h2 class="text-lg font-semibold mb-4">Nouveau RSVP</h2>

			<div class="rounded-md border border-[#e5e5e5] bg-[#f3f4f6] p-4 mb-6">
				<div class="text-sm text-gray-600">Réponse de</div>
				<div class="mt-1 flex items-center justify-between gap-3">
					<div class="text-base font-semibold">{mainGuestName}</div>
					{#if status === 'present'}
						<span
							class="inline-block rounded-full bg-white px-3 py-1 text-sm font-semibold text-[#5E7E66]"
						>
							PRÉSENT
						</span>
					{:else}
						<span
							class="inline-block rounded-full bg-white px-3 py-1 text-sm font-semibold text-red-600"
						>
							ABSENT
						</span>
					{/if}
				</div>
			</div>

			{#if guests.length > 0}
				<div class="mb-6">
					<h3 class="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-2">
						Accompagnants
					</h3>
					<ul class="rounded-md border border-[#e5e5e5] bg-white p-4 space-y-2">
						{#each guests as guest, i (i)}
							<li class="flex justify-between items-center text-sm">
								<span class="font-medium">{guest.full_name}</span>
								<span
									class="font-semibold {guest.rsvp_status === 'present'
										? 'text-[#5E7E66]'
										: 'text-red-600'}"
								>
									{guest.rsvp_status === 'present' ? 'Présent' : 'Absent'}
								</span>
							</li>
						{/each}
					</ul>
				</div>
			{/if}

			<div class="text-center mt-8">
				<a
					href="https://wedding-vm-202.vercel.app/admin/guests"
					class="inline-block bg-[#5E7E66] text-white px-6 py-3 rounded-md font-semibold no-underline"
				>
					Ouvrir le dashboard
				</a>
				<p class="text-xs text-gray-500 mt-3">Lien réservé à l'administration.</p>
			</div>
		</div>
	</div>
</div>
