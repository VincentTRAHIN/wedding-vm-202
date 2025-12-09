<script lang="ts">
	import { Users, Heart, Wine, Utensils, Music, MapPin } from 'lucide-svelte';
	import { cn } from '$lib/utils';
	import { fade, fly } from 'svelte/transition';

	const events = [
		{
			time: '14:00',
			title: 'Arrivée des Invités',
			description:
				'Bienvenue ! Profitez de rafraîchissements dans la cour du domaine en attendant le début des festivités.',
			location: 'La Cour',
			icon: Users
		},
		{
			time: '15:00',
			title: 'La Cérémonie',
			description:
				"Nous échangerons nos vœux sous le grand chêne centenaire. Un moment d'émotion à partager ensemble.",
			location: 'Le Bosquet',
			icon: Heart
		},
		{
			time: '16:00',
			title: 'Cocktail',
			description:
				'Place à la fête ! Champagne, petits fours et musique live sur la terrasse ensoleillée.',
			location: 'La Terrasse',
			icon: Wine
		},
		{
			time: '18:00',
			title: 'Dîner & Discours',
			description:
				'Un repas gastronomique aux saveurs de la Provence, ponctué par les interventions de nos proches.',
			location: 'Grande Salle',
			icon: Utensils
		},
		{
			time: '21:00',
			title: 'Soirée Dansante',
			description:
				"On ouvre le bal ! Préparez vos meilleures chorégraphies pour danser jusqu'au bout de la nuit.",
			location: 'Grande Salle',
			icon: Music
		}
	];
</script>

<div class="min-h-screen bg-stone-50 py-12 md:py-24">
	<!-- Header -->
	<div class="container mx-auto mb-16 px-4 text-center">
		<h1 class="mb-4 font-serif text-4xl font-bold text-primary md:text-5xl">Le Programme</h1>
		<p class="font-sans text-lg text-stone-500">Une timeline de notre journée spéciale.</p>
	</div>

	<!-- Timeline Container -->
	<div class="container mx-auto max-w-5xl px-4">
		<div class="relative">
			<!-- Vertical Line -->
			<!-- Mobile: Left aligned (2rem / 32px center) -->
			<!-- Desktop: Centered -->
			<div
				class="absolute left-8 top-0 h-full w-px -translate-x-1/2 bg-stone-300 md:left-1/2"
			></div>

			<div class="space-y-12 md:space-y-24">
				{#each events as event, i}
					{@const isEven = i % 2 === 0}
					<div
						class="relative flex flex-col md:flex-row md:items-center"
						in:fly={{ y: 50, duration: 800, delay: i * 100 }}
					>
						<!-- Mobile Time Display (Hidden on Desktop) -->
						<div class="mb-2 ml-20 md:hidden">
							<span class="font-serif text-xl font-bold text-sage-700">{event.time}</span>
						</div>

						<!-- Desktop Left Column (50%) -->
						<div class="hidden w-1/2 md:block pr-16 text-right">
							{#if isEven}
								<!-- Even: Time on Left -->
								<div class="flex flex-col items-end">
									<span class="font-serif text-4xl font-bold text-sage-700">{event.time}</span>
								</div>
							{:else}
								<!-- Odd: Card on Left -->
								<div
									class="rounded-xl border border-stone-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md text-left"
								>
									<h3 class="mb-2 font-serif text-xl font-bold text-sage-900">{event.title}</h3>
									<p class="mb-4 text-sm leading-relaxed text-stone-600">{event.description}</p>
									<div class="flex items-center justify-end gap-4 border-t border-stone-100 pt-4">
										<div
											class="flex items-center gap-1 text-xs font-medium uppercase tracking-widest text-stone-500"
										>
											<MapPin class="h-3 w-3" />
											{event.location}
										</div>
									</div>
								</div>
							{/if}
						</div>

						<!-- Center Node (Icon) -->
						<div
							class="absolute left-8 flex h-12 w-12 -translate-x-1/2 items-center justify-center rounded-full border border-stone-200 bg-stone-50 text-sage-700 shadow-sm md:left-1/2 md:h-16 md:w-16 z-10"
						>
							<event.icon class="h-5 w-5 md:h-7 md:w-7" />
						</div>

						<!-- Desktop Right Column (50%) -->
						<!-- Mobile Content Column (Full width with padding) -->
						<div class="w-full pl-20 md:w-1/2 md:pl-16">
							{#if isEven}
								<!-- Even: Card on Right -->
								<div
									class="rounded-xl border border-stone-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
								>
									<h3 class="mb-2 font-serif text-xl font-bold text-sage-900">{event.title}</h3>
									<p class="mb-4 text-sm leading-relaxed text-stone-600">{event.description}</p>
									<div class="flex items-center gap-4 border-t border-stone-100 pt-4">
										<div
											class="flex items-center gap-1 text-xs font-medium uppercase tracking-widest text-stone-500"
										>
											<MapPin class="h-3 w-3" />
											{event.location}
										</div>
									</div>
								</div>
							{:else}
								<!-- Odd: Time on Right (Desktop only) -->
								<div class="hidden flex-col items-start md:flex">
									<span class="font-serif text-4xl font-bold text-sage-700">{event.time}</span>
								</div>
								<!-- Mobile: Card is always here for Odd items too -->
								<div
									class="block rounded-xl border border-stone-200 bg-white p-6 shadow-sm md:hidden"
								>
									<h3 class="mb-2 font-serif text-xl font-bold text-sage-900">{event.title}</h3>
									<p class="mb-4 text-sm leading-relaxed text-stone-600">{event.description}</p>
									<div class="flex items-center gap-4 border-t border-stone-100 pt-4">
										<div
											class="flex items-center gap-1 text-xs font-medium uppercase tracking-widest text-stone-500"
										>
											<MapPin class="h-3 w-3" />
											{event.location}
										</div>
									</div>
								</div>
							{/if}
						</div>
					</div>
				{/each}
			</div>
		</div>
	</div>
</div>
