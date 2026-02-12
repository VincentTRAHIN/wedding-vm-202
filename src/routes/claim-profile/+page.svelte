<script lang="ts">
	import { enhance } from '$app/forms';
	import GuestSelector from '$lib/components/GuestSelector.svelte';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import * as Dialog from '$lib/components/ui/dialog';
	import { toast } from 'svelte-sonner';

	let { data } = $props();
	let selectedGuestId = $state('');
	let showCancelDialog = $state(false);
	let showManagedDialog = $state(false);
	let isSubmitting = $state(false);

	let selectedGuest = $derived(
		data.unclaimedGuests.find((g: { id: string }) => g.id === selectedGuestId)
	);
	let isManaged = $derived(selectedGuest?.managed_by_id);

	function handleClaim() {
		if (isManaged) {
			showManagedDialog = true;
		} else {
			// Submit the form directly
			const form = document.getElementById('claim-form') as HTMLFormElement;
			form?.requestSubmit();
		}
	}
</script>

<div class="flex min-h-screen items-center justify-center bg-stone-50 p-4">
	<Card.Root class="w-full max-w-md">
		<Card.Header>
			<Card.Title class="text-center font-serif text-2xl">Bienvenue !</Card.Title>
			<Card.Description class="text-center">
				Pour accéder au site, identifie-toi en sélectionnant ton nom dans la liste.
			</Card.Description>
		</Card.Header>
		<Card.Content>
			<form
				id="claim-form"
				method="POST"
				action="?/claim"
				use:enhance
				class="space-y-6"
			>
				<div class="space-y-2">
					<label for="guest-selector" class="text-sm font-medium">Ton nom</label>
					<GuestSelector
						guests={data.unclaimedGuests}
						bind:value={selectedGuestId}
						placeholder="Recherche ton nom..."
					/>
					<input type="hidden" name="guestId" value={selectedGuestId} />
				</div>

				<Button type="button" class="w-full" disabled={!selectedGuestId} onclick={handleClaim}>
					C'est moi !
				</Button>

				<div class="relative">
					<div class="absolute inset-0 flex items-center">
						<span class="w-full border-t"></span>
					</div>
					<div class="relative flex justify-center text-xs uppercase">
						<span class="bg-background px-2 text-muted-foreground">ou</span>
					</div>
				</div>

				<Button
					type="button"
					variant="outline"
					class="w-full"
					onclick={() => (showCancelDialog = true)}
				>
					Annuler et supprimer mon compte
				</Button>
			</form>

			<div class="mt-4 rounded-md bg-amber-50 border border-amber-200 p-3 text-sm text-amber-800">
				<p class="font-medium">Pourquoi cette étape ?</p>
				<p class="mt-1 text-xs">
					Pour accéder au site, tu dois t'identifier en sélectionnant ton nom dans la liste. Si tu
					ne trouves pas ton nom ou si tu changes d'avis, tu peux annuler et supprimer ton compte.
				</p>
			</div>
		</Card.Content>
	</Card.Root>

	<!-- Managed Guest Confirmation Dialog -->
	<Dialog.Root bind:open={showManagedDialog}>
		<Dialog.Content>
			<Dialog.Header>
				<Dialog.Title>Profil déjà géré</Dialog.Title>
				<Dialog.Description>
					{#if selectedGuest?.managerName}
						<strong>{selectedGuest.managerName}</strong> a déjà renseigné des informations pour toi.
						Confirmes-tu vouloir lier ce profil à ton compte ?
					{:else}
						Ce profil est déjà géré par un autre invité. Confirmes-tu vouloir le lier à ton compte ?
					{/if}
				</Dialog.Description>
			</Dialog.Header>
			<p class="text-sm text-muted-foreground">
				Tu pourras accéder au site (programme, galerie, RSVP) avec ton propre compte tout en restant dans le groupe.
			</p>
			<Dialog.Footer class="flex-col gap-2 sm:flex-row sm:justify-end">
				<Button
					type="button"
					variant="outline"
					class="w-full sm:w-auto"
					onclick={() => (showManagedDialog = false)}
				>
					Annuler
				</Button>
				<Button
					type="button"
					class="w-full sm:w-auto"
					onclick={() => {
						showManagedDialog = false;
						const form = document.getElementById('claim-form') as HTMLFormElement;
						form?.requestSubmit();
					}}
				>
					Oui, c'est bien moi
				</Button>
			</Dialog.Footer>
		</Dialog.Content>
	</Dialog.Root>

	<!-- Cancel Confirmation Dialog -->
	<Dialog.Root bind:open={showCancelDialog}>
		<Dialog.Content>
			<Dialog.Header>
				<Dialog.Title>Annuler l'inscription ?</Dialog.Title>
				<Dialog.Description>
					Ton compte sera complètement supprimé et tu seras redirigé vers la page de connexion. Tu
					pourras toujours créer un nouveau compte plus tard.
				</Dialog.Description>
			</Dialog.Header>
			<form
				method="POST"
				action="?/cancel"
				use:enhance={() => {
					isSubmitting = true;
					return async ({ result, update }) => {
						isSubmitting = false;
						if (result.type === 'failure') {
							toast.error('Erreur lors de la suppression du compte.');
						}
						await update();
					};
				}}
				class="space-y-4"
			>
				<Dialog.Footer class="flex-col sm:flex-row gap-2">
					<Button
						type="button"
						variant="outline"
						class="w-full sm:w-auto"
						onclick={() => (showCancelDialog = false)}
					>
						Non, continuer
					</Button>
					<Button
						type="submit"
						variant="destructive"
						class="w-full sm:w-auto"
						disabled={isSubmitting}
					>
						{isSubmitting ? 'Suppression...' : 'Oui, supprimer mon compte'}
					</Button>
				</Dialog.Footer>
			</form>
		</Dialog.Content>
	</Dialog.Root>
</div>
