<script lang="ts">
	export let guestName: string;
	export let inviterName: string;
	export let invitationCode: string | undefined = undefined;
	export let email: string;
</script>

<div class="bg-[#FAF9F6] font-serif p-8 text-[#1a1a1a]">
	<div class="max-w-xl mx-auto bg-white p-8 rounded-lg shadow-sm border border-[#e5e5e5]">
		<h1 class="text-2xl font-bold text-[#5E7E66] mb-6 text-center">Vincent & Mélanie</h1>

		<p class="mb-4 text-lg">Bonjour {guestName},</p>

		<p class="mb-6 text-gray-700">
			<strong>{inviterName}</strong> vient de confirmer votre présence à notre mariage !
		</p>

		<div class="text-center my-8">
			<a
				href="https://wedding-vm-202.vercel.app/login?email={encodeURIComponent(email)}"
				class="inline-block bg-[#5E7E66] text-white px-6 py-3 rounded-md font-semibold no-underline hover:bg-[#4a6350] transition-colors"
			>
				Accéder à l'Espace Invité
			</a>
		</div>

		<div class="bg-[#f3f4f6] p-4 rounded-md text-sm text-gray-600 mb-6">
			<p class="mb-2">Pour vous connecter, utilisez cet email : <strong>{email}</strong></p>
			{#if invitationCode}
				<p>Si le site demande un code invité, le voici : <strong>{invitationCode}</strong></p>
			{/if}
		</div>

		<p class="text-center text-gray-500 text-sm mt-8">À très bientôt !</p>
	</div>
</div>
