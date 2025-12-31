<script lang="ts">
	export let guestName: string;
	export let inviterName: string;
	export let invitationCode: string | undefined = undefined;
	export let email: string;
</script>

<div class="bg-[#FAF9F6] font-serif p-8 text-[#1a1a1a]">
	<div
		class="max-w-xl mx-auto bg-white rounded-lg shadow-sm border border-[#e5e5e5] overflow-hidden"
	>
		<div class="bg-[#5E7E66] px-8 py-5 text-white">
			<div class="text-sm opacity-90">Mariage de</div>
			<div class="text-2xl font-bold">Vincent & Mélanie</div>
			<div class="text-sm opacity-90 mt-1">Ton accès à l'espace invité</div>
		</div>

		<div class="p-8">
			<p class="mb-4 text-lg">Coucou {guestName},</p>

			<p class="mb-6 text-gray-700">
				<strong>{inviterName}</strong> vient de confirmer ta présence à notre mariage.
			</p>

			<div class="text-center my-8">
				<a
					href="https://wedding-vm-202.vercel.app/login?email={encodeURIComponent(email)}"
					class="inline-block bg-[#5E7E66] text-white px-6 py-3 rounded-md font-semibold no-underline"
				>
					Accéder à l'Espace Invité
				</a>
				<p class="text-xs text-gray-500 mt-3">
					Si le bouton ne fonctionne pas, copie/colle le lien dans ton navigateur.
				</p>
			</div>

			<div class="rounded-md border border-[#e5e5e5] bg-[#f3f4f6] p-5 text-sm text-gray-700 mb-6">
				<p class="font-semibold mb-3">Ton petit pass :</p>
				<div class="space-y-2">
					<p>
						<span class="text-gray-600">Email</span> : <strong>{email}</strong>
					</p>
					{#if invitationCode}
						<p>
							<span class="text-gray-600">Code invité</span> : <strong>{invitationCode}</strong>
						</p>
					{/if}
				</div>
			</div>

			<p class="text-center text-gray-600 text-sm mt-8">On a trop hâte de te voir !</p>
		</div>
	</div>
</div>
