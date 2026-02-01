<script lang="ts">
	import { Users, Heart, Wine, Utensils, Music, MapPin, Trophy, Moon } from 'lucide-svelte';
	import { fly } from 'svelte/transition';
	import { cn } from '$lib/utils';

	let { data } = $props();

	let isComplet = $derived(data.invitationType === 'complet');

	type TimelineEvent = {
		type: 'event';
		time: string;
		title: string;
		description: string;
		location: string;
		icon: typeof Users;
		major?: boolean;
		forType: 'all' | 'complet_only';
	};

	type TimelineSeparator = {
		type: 'separator';
		title: string;
		subtitle?: string;
		day: 'saturday' | 'sunday';
	};

	type TimelineItem = TimelineEvent | TimelineSeparator;

	const allItems: TimelineItem[] = [
		{ type: 'separator', title: 'Samedi 18 juillet', subtitle: 'Jour J', day: 'saturday' },
		{
			type: 'event',
			time: '15:00',
			title: 'Ouverture des portes',
			description: "On t'accueille au domaine. Prends le temps d'arriver tranquillement.",
			location: "Jardin d'honneur",
			icon: Users,
			forType: 'all'
		},
		{
			type: 'event',
			time: '15:30',
			title: 'Cérémonie',
			description: "C'est parti pour le grand moment !",
			location: "Jardin d'honneur",
			icon: Heart,
			major: true,
			forType: 'all'
		},
		{
			type: 'event',
			time: '17:30',
			title: "Cocktail d'honneur",
			description: 'Un verre, des petites bouchées et beaucoup de sourires.',
			location: "Jardin d'honneur",
			icon: Wine,
			forType: 'all'
		},
		{
			type: 'event',
			time: '20:00',
			title: 'Dîner',
			description: 'On passe à table !',
			location: 'Chapiteau',
			icon: Utensils,
			major: true,
			forType: 'complet_only'
		},
		{
			type: 'event',
			time: '23:00',
			title: 'Ouverture du bal',
			description: 'On lance la piste !',
			location: 'Chapiteau',
			icon: Music,
			forType: 'complet_only'
		},
		{
			type: 'event',
			time: '04:00',
			title: 'Fin de soirée',
			description: 'On se dit bonne nuit (ou bonjour).',
			location: 'Ton lit',
			icon: Moon,
			forType: 'complet_only'
		},
		{
			type: 'separator',
			title: 'Dimanche 19 juillet',
			subtitle: 'Brunch & Finale',
			day: 'sunday'
		},
		{
			type: 'event',
			time: '11:00',
			title: 'Début des festivités',
			description: 'On se retrouve pour continuer la fête ! Mais avant on prend un petit café.',
			location: 'Domaine',
			icon: Users,
			forType: 'complet_only'
		},
		{
			type: 'event',
			time: '12:00',
			title: 'Brunch Fouées & Détente',
			description: 'Jeux de société, jeux de plein air, Cornhole... On profite encore !',
			location: 'Domaine',
			icon: Utensils,
			major: true,
			forType: 'complet_only'
		},
		{
			type: 'event',
			time: '21:00',
			title: 'Finale de la Coupe du Monde',
			description: 'Allez les Bleus ! 🇫🇷',
			location: 'New Jersey / Bar',
			icon: Trophy,
			forType: 'complet_only'
		}
	];

	// Assign days to events based on the last separator seen
	let currentDay: 'saturday' | 'sunday' = 'saturday';
	const itemsWithDay = allItems.map((item) => {
		if (item.type === 'separator') {
			currentDay = item.day;
		}
		return { ...item, day: currentDay };
	});

	let saturdayItems = $derived(
		itemsWithDay
			.filter((item) => item.day === 'saturday')
			.filter(
				(item) => item.type === 'separator' || (isComplet || item.forType === 'all')
			)
	);

	let sundayItems = $derived(
		itemsWithDay
			.filter((item) => item.day === 'sunday')
			.filter(
				(item) => item.type === 'separator' || (isComplet || item.forType === 'all')
			)
	);

	let activeTab = $state<'saturday' | 'sunday'>('saturday');
	let currentItems = $derived(activeTab === 'saturday' ? saturdayItems : sundayItems);
</script>

<div class="min-h-screen bg-stone-50 py-12 md:py-24">
	<!-- Header -->
	<div class="container mx-auto mb-12 px-4 text-center">
		<h1 class="mb-4 font-serif text-4xl font-bold text-primary md:text-5xl">Ton Programme</h1>
		<p class="font-sans text-lg text-muted-foreground">
			{#if isComplet}
				Tout le programme de ce week-end spécial.
			{:else}
				Le programme de ta journée.
			{/if}
		</p>
	</div>

	<!-- Tabs -->
	<div class="container mx-auto mb-12 max-w-xl px-4">
		<div class="flex rounded-lg border border-stone-200 bg-white p-1 shadow-sm">
			<button
				type="button"
				class={cn(
					'flex-1 rounded-md px-4 py-3 text-center text-sm font-semibold transition-all',
					activeTab === 'saturday'
						? 'bg-primary text-white shadow-sm'
						: 'text-muted-foreground hover:text-foreground'
				)}
				onclick={() => (activeTab = 'saturday')}
			>
				Samedi 18 Juillet
			</button>
			{#if isComplet}
				<button
					type="button"
					class={cn(
						'flex-1 rounded-md px-4 py-3 text-center text-sm font-semibold transition-all',
						activeTab === 'sunday'
							? 'bg-primary text-white shadow-sm'
							: 'text-muted-foreground hover:text-foreground'
					)}
					onclick={() => (activeTab = 'sunday')}
				>
					Dimanche 19 Juillet
				</button>
			{/if}
		</div>
	</div>

	<!-- Timeline Container -->
	<div class="container mx-auto max-w-5xl px-4">
		<div class="relative">
			<!-- Vertical Line -->
			<div
				class="absolute left-8 top-0 h-full w-px -translate-x-1/2 bg-stone-300 md:left-1/2"
			></div>

			<div class="space-y-12 md:space-y-24">
				{#each currentItems as item, i (item.type === 'separator' ? item.title : item.title + item.time)}
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
						{@const isMajor = event.major}
						<div
							class="relative flex flex-col md:flex-row md:items-center"
							in:fly={{ y: 50, duration: 800, delay: i * 100 }}
						>
							<!-- Mobile Time Display -->
							<div class="mb-2 ml-20 md:hidden">
								<span class={cn('font-serif font-bold text-primary', isMajor ? 'text-2xl' : 'text-xl')}>{event.time}</span>
							</div>

							<!-- Desktop Left Column -->
							<div class="hidden w-1/2 pr-16 text-right md:block">
								{#if isEven}
									<div class="flex flex-col items-end">
										<span class={cn('font-serif font-bold text-primary', isMajor ? 'text-5xl' : 'text-4xl')}>{event.time}</span>
									</div>
								{:else}
									<div
										class={cn(
											'rounded-xl border bg-white text-left shadow-sm transition-shadow hover:shadow-md',
											isMajor ? 'border-primary/20 p-8' : 'border-stone-200 p-6'
										)}
									>
										<h3 class={cn('mb-2 font-serif font-bold text-foreground', isMajor ? 'text-2xl' : 'text-xl')}>{event.title}</h3>
										<p class={cn('mb-4 leading-relaxed text-muted-foreground', isMajor ? 'text-base' : 'text-sm')}>
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

							<!-- Center Node -->
							<div
								class={cn(
									'absolute left-8 flex -translate-x-1/2 items-center justify-center rounded-full border shadow-sm md:left-1/2 z-10',
									isMajor
										? 'h-14 w-14 border-primary/30 bg-primary/10 text-primary md:h-20 md:w-20'
										: 'h-12 w-12 border-stone-200 bg-stone-50 text-primary md:h-16 md:w-16'
								)}
							>
								<event.icon class={cn(isMajor ? 'h-6 w-6 md:h-8 md:w-8' : 'h-5 w-5 md:h-7 md:w-7')} />
							</div>

							<!-- Desktop Right / Mobile Content Column -->
							<div class="w-full pl-20 md:w-1/2 md:pl-16">
								{#if isEven}
									<div
										class={cn(
											'rounded-xl border bg-white shadow-sm transition-shadow hover:shadow-md',
											isMajor ? 'border-primary/20 p-8' : 'border-stone-200 p-6'
										)}
									>
										<h3 class={cn('mb-2 font-serif font-bold text-foreground', isMajor ? 'text-2xl' : 'text-xl')}>{event.title}</h3>
										<p class={cn('mb-4 leading-relaxed text-muted-foreground', isMajor ? 'text-base' : 'text-sm')}>
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
									<div class="hidden flex-col items-start md:flex">
										<span class={cn('font-serif font-bold text-primary', isMajor ? 'text-5xl' : 'text-4xl')}>{event.time}</span>
									</div>
									<div
										class={cn(
											'block rounded-xl border bg-white shadow-sm md:hidden',
											isMajor ? 'border-primary/20 p-8' : 'border-stone-200 p-6'
										)}
									>
										<h3 class={cn('mb-2 font-serif font-bold text-foreground', isMajor ? 'text-2xl' : 'text-xl')}>{event.title}</h3>
										<p class={cn('mb-4 leading-relaxed text-muted-foreground', isMajor ? 'text-base' : 'text-sm')}>
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
