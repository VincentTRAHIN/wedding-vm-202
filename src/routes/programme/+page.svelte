<script lang="ts">
	import { Users, Heart, Wine, Utensils, Music, MapPin } from 'lucide-svelte';
	import { fly } from 'svelte/transition';

	type TimelineItem =
		| {
				type: 'event';
				time: string;
				title: string;
				description: string;
				location: string;
				icon: typeof Users;
		  }
		| { type: 'separator'; title: string; subtitle?: string };

	const items: TimelineItem[] = [
		{ type: 'separator', title: 'Samedi', subtitle: 'Jour J' },
		{
			type: 'event',
			time: '15:00',
			title: 'Ouverture des portes',
			description: "On t'accueille au domaine. Prends le temps d'arriver tranquillement.",
			location: 'Domaine',
			icon: Users
		},
		{
			type: 'event',
			time: '15:30',
			title: 'Cérémonie (début)',
			description: "C'est parti pour le grand moment !",
			location: 'Cérémonie',
			icon: Heart
		},
		{
			type: 'event',
			time: '17:30',
			title: "Cocktail d'honneur",
			description: 'Un verre, des petites bouchées et beaucoup de sourires.',
			location: 'Cocktail',
			icon: Wine
		},
		{
			type: 'event',
			time: '20:00',
			title: 'Dîner',
			description: 'On passe à table !',
			location: 'Dîner',
			icon: Utensils
		},
		{
			type: 'event',
			time: '23:00',
			title: 'Ouverture du bal',
			description: 'On lance la piste !',
			location: 'Bal',
			icon: Music
		},
		{
			type: 'event',
			time: '04:00',
			title: 'Fin de soirée',
			description: 'On se dit bonne nuit (ou bonjour).',
			location: 'Fin',
			icon: Music
		},
		{ type: 'separator', title: 'Dimanche', subtitle: 'Brunch & détente' },
		{
			type: 'event',
			time: '11:00',
			title: 'Brunch (début)',
			description: 'On se retrouve pour manger un bout et papoter.',
			location: 'Brunch',
			icon: Utensils
		},
		{
			type: 'event',
			time: '14:00',
			title: 'Après-midi Jeux & Détente',
			description: 'Jeux, chill, et on profite encore un peu.',
			location: 'Domaine',
			icon: Users
		}
	];
</script>

<div class="min-h-screen bg-stone-50 py-12 md:py-24">
	<!-- Header -->
	<div class="container mx-auto mb-16 px-4 text-center">
		<h1 class="mb-4 font-serif text-4xl font-bold text-primary md:text-5xl">Le Programme</h1>
		<p class="font-sans text-lg text-muted-foreground">Une timeline de ce week-end spécial.</p>
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
				{#each items as item, i (i)}
					{#if item.type === 'separator'}
						<div class="relative pl-20 md:pl-0">
							<div
								class="rounded-xl border border-stone-200 bg-white p-6 shadow-sm md:mx-auto md:max-w-xl"
							>
								<h2 class="font-serif text-2xl font-bold text-primary">{item.title}</h2>
								{#if item.subtitle}
									<p class="mt-1 text-sm text-muted-foreground">{item.subtitle}</p>
								{/if}
							</div>
						</div>
					{:else}
						{@const event = item}
						{@const isEven = i % 2 === 0}
						<div
							class="relative flex flex-col md:flex-row md:items-center"
							in:fly={{ y: 50, duration: 800, delay: i * 100 }}
						>
							<!-- Mobile Time Display (Hidden on Desktop) -->
							<div class="mb-2 ml-20 md:hidden">
								<span class="font-serif text-xl font-bold text-primary">{event.time}</span>
							</div>

							<!-- Desktop Left Column (50%) -->
							<div class="hidden w-1/2 md:block pr-16 text-right">
								{#if isEven}
									<!-- Even: Time on Left -->
									<div class="flex flex-col items-end">
										<span class="font-serif text-4xl font-bold text-primary">{event.time}</span>
									</div>
								{:else}
									<!-- Odd: Card on Left -->
									<div
										class="rounded-xl border border-stone-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md text-left"
									>
										<h3 class="mb-2 font-serif text-xl font-bold text-foreground">{event.title}</h3>
										<p class="mb-4 text-sm leading-relaxed text-muted-foreground">
											{event.description}
										</p>
										<div class="flex items-center justify-end gap-4 border-t border-stone-100 pt-4">
											<div
												class="flex items-center gap-1 text-xs font-medium uppercase tracking-widest text-muted-foreground"
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
								class="absolute left-8 flex h-12 w-12 -translate-x-1/2 items-center justify-center rounded-full border border-stone-200 bg-stone-50 text-primary shadow-sm md:left-1/2 md:h-16 md:w-16 z-10"
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
										<h3 class="mb-2 font-serif text-xl font-bold text-foreground">{event.title}</h3>
										<p class="mb-4 text-sm leading-relaxed text-muted-foreground">
											{event.description}
										</p>
										<div class="flex items-center gap-4 border-t border-stone-100 pt-4">
											<div
												class="flex items-center gap-1 text-xs font-medium uppercase tracking-widest text-muted-foreground"
											>
												<MapPin class="h-3 w-3" />
												{event.location}
											</div>
										</div>
									</div>
								{:else}
									<!-- Odd: Time on Right (Desktop only) -->
									<div class="hidden flex-col items-start md:flex">
										<span class="font-serif text-4xl font-bold text-primary">{event.time}</span>
									</div>
									<!-- Mobile: Card is always here for Odd items too -->
									<div
										class="block rounded-xl border border-stone-200 bg-white p-6 shadow-sm md:hidden"
									>
										<h3 class="mb-2 font-serif text-xl font-bold text-foreground">{event.title}</h3>
										<p class="mb-4 text-sm leading-relaxed text-muted-foreground">
											{event.description}
										</p>
										<div class="flex items-center gap-4 border-t border-stone-100 pt-4">
											<div
												class="flex items-center gap-1 text-xs font-medium uppercase tracking-widest text-muted-foreground"
											>
												<MapPin class="h-3 w-3" />
												{event.location}
											</div>
										</div>
									</div>
								{/if}
							</div>
						</div>
					{/if}
				{/each}
			</div>
		</div>
	</div>
</div>
