<script lang="ts">
	export let guestName: string;
	export let inviterName: string;
	export let email: string;
</script>

<div class="bg-[#FAF9F6] font-serif p-8 text-[#1a1a1a]">
	<div
		class="max-w-xl mx-auto bg-white rounded-lg shadow-sm border border-[#e5e5e5] overflow-hidden"
	>
		<div class="bg-[#5E7E66] px-8 py-5 text-white">
			<div class="text-sm opacity-90">💍 Mariage de</div>
			<div class="text-2xl font-bold">Mélanie & Vincent</div>
			<div class="text-sm opacity-90 mt-1">✨ Ton accès à l'espace invité</div>
		</div>

		<div class="p-8">
			<p class="mb-4 text-lg">👋 Coucou {guestName},</p>

			<p class="mb-6 text-gray-700">
				<strong>{inviterName}</strong> vient de confirmer ta présence à notre mariage ! 🎉🥳
			</p>

			<p class="mb-6 text-gray-700">
				Ton RSVP a déjà été rempli. Tu peux maintenant te connecter à notre espace invité pour
				découvrir tous les détails du mariage, la galerie photos 📸, le programme de la journée 🗓️,
				et bien plus encore !
			</p>

			<div class="text-center my-8">
				<a
					href="https://july18.melanie.vincent-trahin.dev/login?email={encodeURIComponent(email)}"
					class="inline-block bg-[#5E7E66] text-white px-8 py-4 rounded-lg font-semibold no-underline text-base shadow-sm hover:bg-[#4d6855] transition-colors"
					style="text-decoration: none;"
				>
					🔓 Accéder à mon Espace Invité
				</a>
				<p class="text-xs text-gray-500 mt-4">
					Si le bouton ne fonctionne pas, copie/colle le lien dans ton navigateur.
				</p>
			</div>

			<div class="rounded-lg border border-[#e5e5e5] bg-[#f3f4f6] p-5 text-sm text-gray-700 mb-6">
				<p class="font-semibold mb-3">📧 Pour te connecter :</p>
				<div class="space-y-2">
					<p class="bg-white px-3 py-2 rounded border border-gray-200">
						<span class="text-gray-600">Email :</span> <strong>{email}</strong>
					</p>
					<p class="text-xs text-gray-500">
						💡 Tu peux créer un compte avec cet email ou te connecter via Google.
					</p>
				</div>
			</div>

			<p class="text-center text-gray-600 text-sm mt-8">💕 On a trop hâte de te voir !</p>
		</div>
	</div>
</div>
