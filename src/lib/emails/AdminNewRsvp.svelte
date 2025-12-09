<script lang="ts">
	export let mainGuestName: string;
	export let status: string;
	export let guests: { full_name: string; rsvp_status: string }[] = [];
</script>

<div class="bg-white font-sans p-8 text-[#1a1a1a]">
	<div class="max-w-xl mx-auto border border-gray-200 p-6 rounded-lg">
		<h1 class="text-xl font-bold text-gray-900 mb-4">Nouveau RSVP ! 🔔</h1>

		<p class="mb-4">
			<strong>{mainGuestName}</strong> a répondu :
			{#if status === 'present'}
				<span class="text-green-600 font-bold">PRÉSENT</span>
			{:else}
				<span class="text-red-600 font-bold">ABSENT</span>
			{/if}
		</p>

		{#if guests.length > 0}
			<div class="mb-6">
				<h2 class="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">
					Accompagnants
				</h2>
				<ul class="bg-gray-50 p-4 rounded-md space-y-2">
					{#each guests as guest}
						<li class="flex justify-between text-sm">
							<span>{guest.full_name}</span>
							<span
								class="font-medium {guest.rsvp_status === 'present'
									? 'text-green-600'
									: 'text-red-600'}"
							>
								{guest.rsvp_status === 'present' ? 'Présent' : 'Absent'}
							</span>
						</li>
					{/each}
				</ul>
			</div>
		{/if}

		<div class="mt-6 pt-6 border-t border-gray-100">
			<a
				href="https://wedding-vm-202.vercel.app/admin/guests"
				class="text-blue-600 hover:underline text-sm"
			>
				Voir dans le Dashboard →
			</a>
		</div>
	</div>
</div>
