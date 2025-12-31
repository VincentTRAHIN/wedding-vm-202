<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { MapPin, Navigation } from 'lucide-svelte';

	let { venue } = $props<{
		venue: {
			name: string;
			address: string;
			coords: { lat: number; lng: number };
		};
	}>();

	const destinationQuery = $derived(encodeURIComponent(`${venue.name}, ${venue.address}`));
	const wazeLink = $derived(
		`https://waze.com/ul?ll=${venue.coords.lat},${venue.coords.lng}&navigate=yes`
	);
	const mapsLink = $derived(
		`https://www.google.com/maps/dir/?api=1&destination=${venue.coords.lat},${venue.coords.lng}`
	);
	const embedLink =
		'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d690363.1258669095!2d-0.9339330139280028!3d47.4756719865999!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x4807b9ac3adb523d%3A0x85422e0eab6a0b4f!2sCh%C3%A2teau%20des%20Landes!5e0!3m2!1sfr!2sfr!4v1767168930190!5m2!1sfr!2sfr';
</script>

<Card.Root>
	<Card.Header>
		<Card.Title>Logistique & GPS</Card.Title>
		<Card.Description>Pour arriver sereinement le jour J.</Card.Description>
	</Card.Header>
	<Card.Content class="space-y-4">
		<div class="flex items-start gap-3">
			<MapPin class="mt-0.5 h-5 w-5 text-primary" />
			<div>
				<p class="font-medium">{venue.name}</p>
				<p class="text-sm text-muted-foreground">{venue.address}</p>
			</div>
		</div>

		<div class="grid gap-2 sm:grid-cols-2">
			<Button variant="outline" class="w-full gap-2" href={wazeLink} target="_blank">
				<Navigation class="h-4 w-4" />
				Ouvrir Waze
			</Button>
			<Button variant="outline" class="w-full gap-2" href={mapsLink} target="_blank">
				<MapPin class="h-4 w-4" />
				Ouvrir Google Maps
			</Button>
		</div>

		<div class="overflow-hidden rounded-lg border border-stone-200">
			<iframe
				title="Carte du lieu"
				src={embedLink}
				class="h-64 w-full"
				loading="lazy"
				referrerpolicy="no-referrer-when-downgrade"
			></iframe>
		</div>
	</Card.Content>
</Card.Root>
