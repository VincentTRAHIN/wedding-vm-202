<script lang="ts">
	import RecapCard from './components/RecapCard.svelte';
	import LocationCard from './components/LocationCard.svelte';
	import RoomCard from './components/RoomCard.svelte';
	import SongRequestsCard from './components/SongRequestsCard.svelte';
	import WeatherDressCodeCard from './components/WeatherDressCodeCard.svelte';
	import BrunchCard from './components/BrunchCard.svelte';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';

	let { data } = $props();
	let { guest, venue, songRequests, weather, brunchInfo } = $derived(data);

	let showPasswordSuccess = $state(false);

	onMount(() => {
		if ($page.url.searchParams.get('password_updated') === 'true') {
			showPasswordSuccess = true;
			// Auto-hide after 5 seconds
			setTimeout(() => {
				showPasswordSuccess = false;
			}, 5000);
		}
	});
</script>

<div class="min-h-screen bg-stone-50 py-12 md:py-24">
	<div class="container mx-auto px-4">
		{#if showPasswordSuccess}
			<div
				class="mb-6 rounded-lg border border-green-200 bg-green-50 p-4 text-center text-green-800"
			>
				<p class="font-semibold">✅ Mot de passe modifié avec succès !</p>
				<p class="text-sm mt-1">Tu peux maintenant te connecter avec ton nouveau mot de passe.</p>
			</div>
		{/if}

		<div class="mb-12 text-center">
			<h1 class="mb-4 font-serif text-4xl font-bold text-primary md:text-5xl">
				Bonjour {guest.full_name?.split(' ')[0]}
			</h1>
			<p class="text-lg text-muted-foreground">
				Bienvenue sur ton espace personnel. Retrouve ici toutes les informations pour le mariage.
			</p>
		</div>

		<div class="grid gap-8 lg:grid-cols-2">
			<!-- Column A -->
			<div class="space-y-8">
				<RecapCard {guest} />
				{#if guest.room}
					<div class="space-y-4">
						<h2 class="font-serif text-2xl font-bold text-primary">Ton Hébergement</h2>
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
