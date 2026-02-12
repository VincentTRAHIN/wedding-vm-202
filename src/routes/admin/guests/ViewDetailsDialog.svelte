<script lang="ts">
	import { Button, buttonVariants } from '$lib/components/ui/button';
	import * as Dialog from '$lib/components/ui/dialog';
	import { Eye } from 'lucide-svelte';
	import type { Database } from '$lib/types/supabase';

	type Guest = Database['public']['Tables']['guests']['Row'];

	let { guest } = $props<{
		guest: Guest;
	}>();

	let isOpen = $state(false);
</script>

<Dialog.Root bind:open={isOpen}>
	<Dialog.Trigger class={buttonVariants({ variant: 'ghost', size: 'icon', className: 'h-8 w-8' })}>
		<Eye class="h-4 w-4" />
		<span class="sr-only">Voir les détails</span>
	</Dialog.Trigger>
	<Dialog.Content class="sm:max-w-[500px]">
		<Dialog.Header>
			<Dialog.Title>Détails de l'invité</Dialog.Title>
			<Dialog.Description>
				Informations complètes pour {guest.full_name}
			</Dialog.Description>
		</Dialog.Header>

		<div class="space-y-4 py-4">
			<div class="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4">
				<div class="font-semibold text-sm text-muted-foreground">Nom</div>
				<div class="sm:col-span-2">{guest.full_name || '-'}</div>
			</div>

			<div class="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4">
				<div class="font-semibold text-sm text-muted-foreground">Email</div>
				<div class="sm:col-span-2 break-words">{guest.email || '-'}</div>
			</div>

			<div class="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4">
				<div class="font-semibold text-sm text-muted-foreground">Statut RSVP</div>
				<div class="sm:col-span-2">
					{#if guest.rsvp_status === 'present'}
						<span class="text-green-600 font-medium">Présent</span>
					{:else if guest.rsvp_status === 'absent'}
						<span class="text-red-600 font-medium">Absent</span>
					{:else}
						<span class="text-muted-foreground">En attente</span>
					{/if}
				</div>
			</div>

			{#if guest.rsvp_status === 'present'}
				<div class="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4">
					<div class="font-semibold text-sm text-muted-foreground">Jours de présence</div>
					<div class="sm:col-span-2 space-y-1">
						{#if guest.present_saturday}
							<div class="flex items-center gap-2">
								<span class="text-xs font-medium text-green-600">✓</span>
								<span class="text-sm">Samedi 18 juillet — Cérémonie & Soirée</span>
							</div>
						{/if}
						{#if guest.present_sunday}
							<div class="flex items-center gap-2">
								<span class="text-xs font-medium text-green-600">✓</span>
								<span class="text-sm">Dimanche 19 juillet — Brunch</span>
							</div>
						{/if}
						{#if !guest.present_saturday && !guest.present_sunday}
							<span class="text-sm text-muted-foreground">Aucun jour sélectionné</span>
						{/if}
					</div>
				</div>
			{/if}

			{#if guest.dietary_restrictions}
				<div class="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4">
					<div class="font-semibold text-sm text-muted-foreground">Régime alimentaire</div>
					<div class="sm:col-span-2">{guest.dietary_restrictions}</div>
				</div>
			{/if}

			{#if guest.message_for_couple}
				<div class="space-y-2">
					<div class="font-semibold text-sm text-muted-foreground">Message pour les mariés</div>
					<div class="rounded-md bg-muted p-3 text-sm">
						{guest.message_for_couple}
					</div>
				</div>
			{/if}

			{#if guest.is_child}
				<div class="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4">
					<div class="font-semibold text-sm text-muted-foreground">Type</div>
					<div class="sm:col-span-2">
						<span class="text-xs font-medium text-blue-600">Enfant (-18 ans)</span>
					</div>
				</div>
			{/if}

			{#if !guest.dietary_restrictions && !guest.message_for_couple}
				<div class="rounded-md bg-muted p-4 text-center text-sm text-muted-foreground">
					Aucun détail supplémentaire fourni
				</div>
			{/if}
		</div>

		<Dialog.Footer>
			<Button variant="outline" onclick={() => (isOpen = false)} class="w-full sm:w-auto">Fermer</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
