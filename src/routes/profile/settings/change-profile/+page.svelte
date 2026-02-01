<script lang="ts">
	import { enhance } from '$app/forms';
	import GuestSelector from '$lib/components/GuestSelector.svelte';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import * as Dialog from '$lib/components/ui/dialog';
	import { toast } from 'svelte-sonner';
	import { Loader2, AlertTriangle } from 'lucide-svelte';

	let { data, form } = $props();
	let selectedGuestId = $state('');
	let showConfirmDialog = $state(false);
	let isSubmitting = $state(false);
</script>

<div class="flex min-h-screen items-center justify-center bg-stone-50 p-4">
	<Card.Root class="w-full max-w-md">
		<Card.Header>
			<Card.Title class="font-serif text-2xl">Changer de profil</Card.Title>
			<Card.Description>
				Tu es actuellement lié à <strong>{data.currentGuest.full_name}</strong>. Choisis ton vrai profil :
			</Card.Description>
		</Card.Header>
		<Card.Content>
			{#if form?.message}
				<div class="mb-4 rounded-md bg-destructive/15 p-3 text-sm text-destructive">
					{form.message}
				</div>
			{/if}

			<div class="space-y-4">
				<div class="space-y-2">
					<label for="guest-selector" class="text-sm font-medium">Nouveau profil</label>
					<GuestSelector
						guests={data.availableGuests}
						bind:value={selectedGuestId}
						placeholder="Recherche ton nom..."
					/>
				</div>

				<Button
					type="button"
					class="w-full"
					disabled={!selectedGuestId}
					onclick={() => (showConfirmDialog = true)}
				>
					Changer de profil
				</Button>

				<Button href="/profile/settings" variant="outline" class="w-full">
					Retour aux paramètres
				</Button>
			</div>
		</Card.Content>
	</Card.Root>

	<!-- Confirmation Dialog -->
	<Dialog.Root bind:open={showConfirmDialog}>
		<Dialog.Content>
			<Dialog.Header>
				<Dialog.Title class="flex items-center gap-2">
					<AlertTriangle class="h-5 w-5 text-amber-500" />
					Confirmer le changement
				</Dialog.Title>
				<Dialog.Description>
					Ton RSVP sur l'ancien profil ({data.currentGuest.full_name}) sera réinitialisé. Tu devras refaire ton RSVP.
				</Dialog.Description>
			</Dialog.Header>
			<form
				method="POST"
				action="?/changeProfile"
				use:enhance={() => {
					isSubmitting = true;
					return async ({ result, update }) => {
						isSubmitting = false;
						if (result.type === 'failure') {
							toast.error('Erreur lors du changement de profil.');
							showConfirmDialog = false;
						}
						await update();
					};
				}}
			>
				<input type="hidden" name="newGuestId" value={selectedGuestId} />
				<Dialog.Footer class="flex-col gap-2 sm:flex-row">
					<Button
						type="button"
						variant="outline"
						class="w-full sm:w-auto"
						onclick={() => (showConfirmDialog = false)}
					>
						Annuler
					</Button>
					<Button type="submit" variant="destructive" class="w-full sm:w-auto" disabled={isSubmitting}>
						{#if isSubmitting}
							<Loader2 class="mr-2 h-4 w-4 animate-spin" />
						{/if}
						Confirmer le changement
					</Button>
				</Dialog.Footer>
			</form>
		</Dialog.Content>
	</Dialog.Root>
</div>
