<script lang="ts">
	import RecapCard from './components/RecapCard.svelte';
	import LocationCard from './components/LocationCard.svelte';
	import RoomCard from './components/RoomCard.svelte';
	import SongRequestsCard from './components/SongRequestsCard.svelte';
	import WeatherDressCodeCard from './components/WeatherDressCodeCard.svelte';
	import BrunchCard from './components/BrunchCard.svelte';

	let { data } = $props();
	let { guest, venue, songRequests, weather, brunchInfo } = $derived(data);
</script>

<div class="min-h-screen bg-stone-50 py-12 md:py-24">
	<div class="container mx-auto px-4">
		<div class="mb-12 text-center">
			<h1 class="mb-4 font-serif text-4xl font-bold text-primary md:text-5xl">
				Bonjour {guest.full_name?.split(' ')[0]}
			</h1>
			<p class="text-lg text-muted-foreground">
				Bienvenue sur votre espace personnel. Retrouvez ici toutes les informations pour le mariage.
			</p>
		</div>

		<div class="grid gap-8 lg:grid-cols-2">
			<!-- Column A -->
			<div class="space-y-8">
				<RecapCard {guest} />
				{#if guest.room}
					<div class="space-y-4">
						<h2 class="font-serif text-2xl font-bold text-primary">Votre Hébergement</h2>
						<RoomCard
							room={guest.room}
							checkInDate={guest.check_in_date}
							checkOutDate={guest.check_out_date}
						/>
						{#if guest.room_notes}
							<div
								class="rounded-md border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-800"
							>
								<strong>Note:</strong>
								{guest.room_notes}
							</div>
						{/if}
					</div>
				{/if}
				<SongRequestsCard {songRequests} />
			</div>

			<!-- Column B -->
			<div class="space-y-8">
				<LocationCard {venue} />
				<WeatherDressCodeCard {weather} />
				<BrunchCard {brunchInfo} />
			</div>
		</div>
	</div>
</div>
