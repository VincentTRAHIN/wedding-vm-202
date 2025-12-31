<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import { Cloud, CloudRain, CloudSun, Sun } from 'lucide-svelte';

	type WeatherStatus =
		| {
				status: 'available';
				date: string;
				temp_min_c: number;
				temp_max_c: number;
				weather_code: number;
		  }
		| { status: 'error'; message: string };

	let { weather } = $props<{ weather: WeatherStatus }>();

	function iconFor(code: number) {
		if (code === 0) return Sun;
		if (code >= 1 && code <= 3) return CloudSun;
		if (code >= 51 && code <= 99) return CloudRain;
		return Cloud;
	}

	function formatFrenchDate(dateStr: string) {
		const dt = new Date(dateStr);
		if (Number.isNaN(dt.getTime())) return dateStr;
		const formatter = new Intl.DateTimeFormat('fr-FR', {
			weekday: 'long',
			year: 'numeric',
			month: 'long',
			day: '2-digit'
		});
		return `le ${formatter.format(dt)}`;
	}
</script>

<Card.Root>
	<Card.Header>
		<Card.Title>Météo</Card.Title>
		<Card.Description>Pour te donner une idée sur place.</Card.Description>
	</Card.Header>
	<Card.Content class="space-y-4">
		<div class="rounded-lg bg-stone-50 p-4">
			{#if weather.status === 'error'}
				<p class="text-sm text-muted-foreground">Météo indisponible.</p>
				<p class="mt-1 text-sm">{weather.message}</p>
			{:else}
				{@const Icon = iconFor(weather.weather_code)}
				<div class="flex items-center gap-3">
					<Icon class="h-5 w-5 text-sage-600" />
					<div>
						<p class="text-sm text-muted-foreground">
							Prévision {formatFrenchDate(weather.date)}
						</p>
						<p class="font-medium">
							{Math.round(weather.temp_min_c)}° / {Math.round(weather.temp_max_c)}°
						</p>
					</div>
				</div>
			{/if}
		</div>
	</Card.Content>
</Card.Root>
