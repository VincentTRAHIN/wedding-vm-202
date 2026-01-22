<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import { Coffee, MapPin, Clock, Utensils, Users, Trophy } from 'lucide-svelte';

	let { brunchInfo } = $props<{ brunchInfo: unknown }>();

	function getString(obj: unknown, key: string): string | null {
		if (!obj || typeof obj !== 'object') return null;
		const value = (obj as Record<string, unknown>)[key];
		return typeof value === 'string' && value.trim().length > 0 ? value : null;
	}

	let startTime = $derived(getString(brunchInfo, 'start_time'));
	let location = $derived(getString(brunchInfo, 'location'));
	let menu = $derived(getString(brunchInfo, 'menu'));
</script>

<Card.Root>
	<Card.Header>
		<Card.Title>Dimanche 19 juillet — Le Lendemain</Card.Title>
		<Card.Description>Prolonge le week-end avec nous !</Card.Description>
	</Card.Header>
	<Card.Content class="space-y-4">
		<!-- Début festivités -->
		<div class="rounded-lg bg-stone-50 p-4">
			<div class="flex items-center gap-2 mb-3">
				<Clock class="h-4 w-4 text-primary" />
				<span class="font-medium">11h00 - Début des festivités</span>
			</div>
			<p class="text-sm text-muted-foreground">
				On se retrouve pour continuer la fête ! Mais avant on prend un petit café.
			</p>
		</div>

		<!-- Brunch Fouées -->
		<div class="rounded-lg bg-stone-50 p-4">
			<div class="flex items-center gap-2 mb-3">
				<Utensils class="h-4 w-4 text-primary" />
				<span class="font-medium">12h00 - Fouées & Détente</span>
			</div>
			<div class="space-y-2 text-sm text-muted-foreground">
				<div class="flex items-center gap-2">
					<MapPin class="h-3 w-3" />
					<span>Domaine</span>
				</div>
				<div class="flex items-start gap-2">
					<Users class="h-3 w-3 mt-0.5" />
					<span>Jeux de société, jeux de plein air, Cornhole... On profite encore !</span>
				</div>
			</div>
		</div>

		<!-- Finale Coupe du Monde -->
		<div class="rounded-lg bg-blue-50 p-4 border border-blue-200">
			<div class="flex items-center gap-2 mb-3">
				<Trophy class="h-4 w-4 text-blue-600" />
				<span class="font-medium text-blue-900">21h00 - Finale de la Coupe du Monde</span>
			</div>
			<div class="space-y-2 text-sm text-blue-800">
				<div class="flex items-center gap-2">
					<MapPin class="h-3 w-3" />
					<span>New Jersey / Bar</span>
				</div>
				<p class="font-medium">🇫🇷 Allez les Bleus !</p>
			</div>
		</div>
	</Card.Content>
</Card.Root>
