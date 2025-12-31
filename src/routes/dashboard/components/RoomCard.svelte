<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import { Bed, MapPin, KeyRound, Copy, Check, Calendar } from 'lucide-svelte';
	import type { Database } from '$lib/types/supabase';

	type Room = Database['public']['Tables']['rooms']['Row'];

	let { room, checkInDate, checkOutDate } = $props<{
		room: Room;
		checkInDate?: string | null;
		checkOutDate?: string | null;
	}>();

	let copied = $state(false);

	async function copyAccessCode() {
		if (!room.access_code) return;
		try {
			await navigator.clipboard.writeText(room.access_code);
			copied = true;
			setTimeout(() => (copied = false), 1500);
		} catch {
			// no-op: clipboard may be unavailable depending on browser permissions
		}
	}
</script>

<Card.Root class="overflow-hidden">
	{#if room.image_url}
		<div class="h-48 w-full overflow-hidden">
			<img src={room.image_url} alt={room.name} class="h-full w-full object-cover" />
		</div>
	{/if}
	<Card.Header>
		<div class="flex items-center justify-between">
			<Card.Title>{room.name}</Card.Title>
			{#if room.lol_region}
				<span class="rounded-full bg-muted px-2 py-1 text-xs font-medium text-foreground">
					{room.lol_region}
				</span>
			{/if}
		</div>
		<Card.Description>{room.description || 'Votre hébergement pour le mariage.'}</Card.Description>
	</Card.Header>
	<Card.Content class="space-y-4">
		<div class="flex items-center gap-2 text-sm text-muted-foreground">
			<Bed class="h-4 w-4" />
			<span>Capacité: {room.capacity} personnes</span>
		</div>
		{#if checkInDate || checkOutDate}
			<div class="flex items-center gap-2 text-sm text-muted-foreground">
				<Calendar class="h-4 w-4" />
				<span>
					{#if checkInDate}
						Arrivée: {checkInDate}
					{/if}
					{#if checkInDate && checkOutDate}
						·
					{/if}
					{#if checkOutDate}
						Départ: {checkOutDate}
					{/if}
				</span>
			</div>
		{/if}
		{#if room.access_code}
			<div class="flex items-center justify-between gap-3 rounded-md bg-stone-50 p-3">
				<div class="flex items-center gap-2 text-sm">
					<KeyRound class="h-4 w-4 text-primary" />
					<span class="text-muted-foreground">Code d'accès:</span>
					<code class="font-mono font-semibold text-foreground">{room.access_code}</code>
				</div>
				<button
					type="button"
					class="inline-flex items-center gap-2 rounded-md border border-stone-200 bg-white px-3 py-2 text-sm font-medium hover:bg-stone-50"
					onclick={copyAccessCode}
				>
					{#if copied}
						<Check class="h-4 w-4" />
						Copié
					{:else}
						<Copy class="h-4 w-4" />
						Copier
					{/if}
				</button>
			</div>
		{/if}
		{#if room.building}
			<div class="flex items-center gap-2 text-sm text-muted-foreground">
				<MapPin class="h-4 w-4" />
				<span>{room.building}</span>
			</div>
		{/if}
		{#if room.amenities && Array.isArray(room.amenities) && room.amenities.length > 0}
			<div class="flex flex-wrap gap-2 pt-2">
				{#each room.amenities as amenity (amenity)}
					<span class="rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground">
						{amenity}
					</span>
				{/each}
			</div>
		{/if}
	</Card.Content>
</Card.Root>
