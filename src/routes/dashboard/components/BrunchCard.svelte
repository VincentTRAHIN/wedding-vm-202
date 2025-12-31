<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import { Coffee, MapPin, Clock } from 'lucide-svelte';

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
		<Card.Title>Lendemain & Brunch</Card.Title>
		<Card.Description>Pour prolonger le week-end.</Card.Description>
	</Card.Header>
	<Card.Content class="space-y-4">
		{#if !startTime && !location && !menu}
			<p class="text-sm text-muted-foreground">Les informations seront communiquées prochainement.</p>
		{:else}
			{#if startTime}
				<div class="flex items-center gap-2 text-sm text-muted-foreground">
					<Clock class="h-4 w-4" />
					<span>{startTime}</span>
				</div>
			{/if}
			{#if location}
				<div class="flex items-center gap-2 text-sm text-muted-foreground">
					<MapPin class="h-4 w-4" />
					<span>{location}</span>
				</div>
			{/if}
			{#if menu}
				<div class="flex items-center gap-2 text-sm text-muted-foreground">
					<Coffee class="h-4 w-4" />
					<span>{menu}</span>
				</div>
			{/if}
		{/if}
	</Card.Content>
</Card.Root>
