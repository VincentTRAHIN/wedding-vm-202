<script lang="ts">
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import { Checkbox } from '$lib/components/ui/checkbox';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Badge } from '$lib/components/ui/badge';
	import { toast } from 'svelte-sonner';
	import { Loader2, Check } from 'lucide-svelte';
	import RsvpFormItem from './RsvpFormItem.svelte';
	import GuestSelector from '$lib/components/GuestSelector.svelte';

	let { data } = $props();

	let isSubmitting = $state(false);
	let selectedManagedGuestId = $state('');
	let isAddingGuest = $state(false);
	let isChild = $state(false);
	let email = $state('');

	// Initialize editing state based on RSVP status
	let isEditing = $state(data.guest.rsvp_status === 'pending');

	let allGuests = $derived([data.guest, ...data.managedGuests]);
	let isDeadlinePassed = $derived(new Date() > new Date(data.RSVP_DEADLINE));

	$effect(() => {
		if (isChild) {
			email = '';
		}
	});
</script>

<div
	class="flex min-h-[calc(100vh-3.5rem)] items-center justify-center bg-stone-50/50 px-4 py-8 sm:px-6"
>
	<Card.Root
		class="w-full max-w-2xl overflow-hidden rounded-xl border-stone-200 bg-white shadow-lg"
	>
		{#if !isEditing}
			<!-- Summary View -->
			<div class="flex flex-col items-center p-8 text-center">
				<div class="mb-6 rounded-full bg-sage-100 p-4 text-sage-600">
					<Check class="h-8 w-8" />
				</div>

				<h1 class="mb-2 font-serif text-3xl font-bold text-sage-900">
					Merci, votre réponse est enregistrée !
				</h1>
				<p class="mb-8 text-stone-500">Nous avons bien pris en compte votre réponse.</p>

				<div
					class="mb-8 w-full max-w-md space-y-4 rounded-lg border border-stone-100 bg-stone-50 p-6"
				>
					<div
						class="flex items-center justify-between border-b border-stone-200 pb-4 last:border-0 last:pb-0"
					>
						<span class="font-medium text-stone-900">Votre statut</span>
						<Badge
							variant={data.guest.rsvp_status === 'present' ? 'default' : 'destructive'}
							class={data.guest.rsvp_status === 'present' ? 'bg-sage-600 hover:bg-sage-700' : ''}
						>
							{data.guest.rsvp_status === 'present' ? 'Présent' : 'Absent'}
						</Badge>
					</div>

					{#if data.managedGuests.length > 0}
						<div class="pt-2 text-left">
							<span class="mb-2 block text-sm font-medium text-stone-500"
								>Vous venez accompagné de :</span
							>
							<ul class="space-y-2">
								{#each data.managedGuests as guest}
									<li class="flex items-center justify-between text-sm">
										<span class="text-stone-900">
											{guest.full_name}
											{#if guest.is_child}
												<span class="text-stone-400">(Enfant)</span>
											{/if}
										</span>
										<Badge variant="outline" class="text-xs">
											{guest.rsvp_status === 'present' ? 'Présent' : 'Absent'}
										</Badge>
									</li>
								{/each}
							</ul>
						</div>
					{/if}
				</div>

				{#if !isDeadlinePassed}
					<Button variant="outline" onclick={() => (isEditing = true)}>Modifier ma réponse</Button>
				{:else}
					<p class="text-sm text-stone-500">
						La date limite de réponse est passée. Contactez les mariés pour tout changement.
					</p>
				{/if}
			</div>
		{:else}
			<!-- Edit View -->
			<div class="bg-white px-6 pb-6 pt-8 text-center">
				<h1 class="font-serif text-3xl font-bold text-sage-900 md:text-4xl">
					Répondez à l'invitation
				</h1>
				<p class="mt-2 text-sm text-stone-500">
					Veuillez confirmer votre présence avant le 1er Mai 2026
				</p>
			</div>

			<Card.Content class="p-6 pt-0">
				<form
					method="POST"
					action="?/update"
					use:enhance={({ action }) => {
						const isRemove = action.search.includes('removeManagedGuest');
						isSubmitting = true;
						return async ({ result, update }) => {
							isSubmitting = false;
							console.log('RSVP Update Result:', result);
							if (result.type === 'success') {
								if (isRemove) {
									toast.success('Invité retiré de votre liste.');
								} else {
									toast.success('Votre réponse a été enregistrée !');
									isEditing = false;
									await invalidateAll();
								}
							} else if (result.type === 'failure') {
								toast.error("Une erreur est survenue lors de l'enregistrement.");
							}
							await update();
						};
					}}
					class="space-y-8"
				>
					{#each allGuests as guest (guest.id)}
						<RsvpFormItem
							{guest}
							prefix="guest_{guest.id}_"
							isRemovable={guest.id !== data.guest.id}
						/>
					{/each}

					<div class="flex gap-4 border-t border-stone-100 pt-4">
						{#if data.guest.rsvp_status !== 'pending'}
							<Button
								type="button"
								variant="outline"
								class="flex-1"
								onclick={() => (isEditing = false)}
								disabled={isSubmitting}
							>
								Annuler
							</Button>
						{/if}
						<Button
							type="submit"
							class="flex-1 bg-sage-600 hover:bg-sage-700"
							disabled={isSubmitting}
						>
							{#if isSubmitting}
								<Loader2 class="mr-2 h-4 w-4 animate-spin" />
							{/if}
							Enregistrer les réponses
						</Button>
					</div>
				</form>

				<!-- Manage other guests -->
				<div class="mt-12 border-t border-stone-200 pt-8">
					<h3 class="mb-4 font-serif text-xl font-bold text-sage-900">Gérer d'autres invités</h3>
					<p class="mb-4 text-sm text-stone-500">
						Vous pouvez ajouter votre conjoint(e) ou vos enfants s'ils sont dans la liste des
						invités.
					</p>

					<form
						method="POST"
						action="?/addManagedGuest"
						use:enhance={() => {
							isAddingGuest = true;
							return async ({ result, update }) => {
								isAddingGuest = false;
								if (result.type === 'success') {
									toast.success('Invité ajouté !');
									selectedManagedGuestId = '';
									isChild = false;
									email = '';
									await invalidateAll();
								} else {
									toast.error("Erreur lors de l'ajout.");
								}
								await update();
							};
						}}
						class="space-y-4"
					>
						<div class="space-y-2">
							<Label>Nom de l'invité</Label>
							<GuestSelector
								guests={data.eligibleGuests}
								bind:value={selectedManagedGuestId}
								placeholder="Rechercher un invité..."
							/>
							<input type="hidden" name="guestId" value={selectedManagedGuestId} />
						</div>

						<div class="flex items-center space-x-2">
							<Checkbox id="is_child" bind:checked={isChild} name="is_child" />
							<Label
								for="is_child"
								class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
							>
								Cette personne est un enfant (-18 ans)
							</Label>
						</div>

						<div class="space-y-2">
							<Label for="email" class={isChild ? 'text-stone-400' : ''}>Email</Label>
							<Input
								type="email"
								id="email"
								name="email"
								placeholder="email@exemple.com"
								bind:value={email}
								disabled={isChild}
								required={!isChild}
								class={isChild ? 'opacity-50' : ''}
							/>
						</div>

						<Button
							type="submit"
							variant="secondary"
							class="w-full"
							disabled={!selectedManagedGuestId || isAddingGuest}
						>
							{#if isAddingGuest}
								<Loader2 class="mr-2 h-4 w-4 animate-spin" />
							{/if}
							Ajouter à ma liste
						</Button>
					</form>
				</div>
			</Card.Content>
		{/if}
	</Card.Root>
</div>
