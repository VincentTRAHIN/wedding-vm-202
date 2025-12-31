<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import { Bed, Calendar, Clock, MapPin, Utensils } from 'lucide-svelte';
	import type { Database } from '$lib/types/supabase';

	type Guest = Database['public']['Tables']['guests']['Row'] & {
		room?: Pick<Database['public']['Tables']['rooms']['Row'], 'name'> | null;
	};

	let { guest } = $props<{ guest: Guest }>();

	const VENUE_NAME = 'Château des Landes';
	const VENUE_ADDRESS = 'Cléré-sur-Layon, Maine-et-Loire';
</script>

<Card.Root>
	<Card.Header>
		<Card.Title>Récapitulatif</Card.Title>
		<Card.Description>Vos informations pour le jour J.</Card.Description>
	</Card.Header>
	<Card.Content class="space-y-6">
		<!-- Date & Heure -->
		<div class="flex items-start gap-3">
			<Calendar class="mt-0.5 h-5 w-5 text-sage-600" />
			<div>
				<p class="font-medium">Samedi 18 Juillet 2026</p>
				<div class="flex items-center gap-1 text-sm text-muted-foreground">
					<Clock class="h-3 w-3" />
					<span>Début à 14h00</span>
				</div>
			</div>
		</div>

		<!-- Lieu -->
		<div class="flex items-start gap-3">
			<MapPin class="mt-0.5 h-5 w-5 text-sage-600" />
			<div>
				<p class="font-medium">{VENUE_NAME}</p>
				<p class="text-sm text-muted-foreground">{VENUE_ADDRESS}</p>
			</div>
		</div>

		<!-- RSVP Status -->
		<div class="rounded-lg bg-sage-50/70 p-4">
			<div class="mb-2 flex items-center justify-between">
				<span class="text-sm font-medium">Votre statut RSVP</span>
				{#if guest.rsvp_status === 'present'}
					<Badge class="bg-sage-600 hover:bg-sage-700">Présent</Badge>
				{:else if guest.rsvp_status === 'absent'}
					<Badge variant="destructive">Absent</Badge>
				{:else}
					<Badge variant="secondary">En attente</Badge>
				{/if}
			</div>
			{#if guest.dietary_restrictions}
				<div class="mt-2 flex items-start gap-2 text-sm text-muted-foreground">
					<Utensils class="mt-0.5 h-3 w-3" />
					<span>Régime: {guest.dietary_restrictions}</span>
				</div>
			{/if}
			{#if guest.room}
				<div class="mt-2 flex items-start gap-2 text-sm text-muted-foreground">
					<Bed class="mt-0.5 h-3 w-3" />
					<span>Votre chambre: {guest.room.name}</span>
				</div>
			{/if}
		</div>
	</Card.Content>
</Card.Root>
