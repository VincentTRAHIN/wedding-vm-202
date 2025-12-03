<script lang="ts">
	import { enhance } from '$app/forms';
	import GuestSelector from '$lib/components/GuestSelector.svelte';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';

	let { data } = $props();
	let selectedGuestId = $state('');
</script>

<div class="flex min-h-screen items-center justify-center bg-stone-50 p-4">
	<Card.Root class="w-full max-w-md">
		<Card.Header>
			<Card.Title class="text-center font-serif text-2xl">Bienvenue !</Card.Title>
			<Card.Description class="text-center">
				Pour accéder au site, veuillez vous identifier en sélectionnant votre nom dans la liste.
			</Card.Description>
		</Card.Header>
		<Card.Content>
			<form method="POST" action="?/claim" use:enhance class="space-y-6">
				<div class="space-y-2">
					<label for="guest-selector" class="text-sm font-medium">Votre nom</label>
					<GuestSelector
						guests={data.unclaimedGuests}
						bind:value={selectedGuestId}
						placeholder="Rechercher votre nom..."
					/>
					<input type="hidden" name="guestId" value={selectedGuestId} />
				</div>

				<Button
					type="submit"
					class="w-full bg-sage-600 hover:bg-sage-700"
					disabled={!selectedGuestId}
				>
					C'est moi !
				</Button>
			</form>
		</Card.Content>
	</Card.Root>
</div>
