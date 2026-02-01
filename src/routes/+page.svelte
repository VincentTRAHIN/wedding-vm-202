<script lang="ts">
	import { onMount } from 'svelte';
	import { Button } from '$lib/components/ui/button';

	let { data } = $props();

	let firstName = $derived(data.guest?.full_name?.split(' ')[0] ?? '');
	let isLoggedIn = $derived(!!data.session);
	let hasResponded = $derived(data.guest?.rsvp_status && data.guest.rsvp_status !== 'pending');

	let timeLeft = $state({ days: 0, hours: 0, minutes: 0, seconds: 0 });
	let timer: ReturnType<typeof setInterval>;

	const targetDate = new Date('2026-07-18T14:00:00');

	function updateTimer() {
		const now = new Date();
		const diff = targetDate.getTime() - now.getTime();

		if (diff <= 0) {
			clearInterval(timer);
			return;
		}

		timeLeft = {
			days: Math.floor(diff / (1000 * 60 * 60 * 24)),
			hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
			minutes: Math.floor((diff / 1000 / 60) % 60),
			seconds: Math.floor((diff / 1000) % 60)
		};
	}

	onMount(() => {
		updateTimer();
		timer = setInterval(updateTimer, 1000);
		return () => clearInterval(timer);
	});

	import heroImage from '$lib/assets/photo_couple_saumur.jpg';
</script>

<div class="flex min-h-screen flex-col">
	<!-- 1. Hero Section -->
	<section class="relative h-[40vh] min-h-[300px] w-full overflow-hidden">
		<!-- Background Image -->
		<div class="absolute inset-0">
			<img src={heroImage} alt="Vincent & Mélanie" class="h-full w-full object-cover" />
			<!-- Overlay -->
			<div class="absolute inset-0 bg-black/20"></div>
		</div>

		<!-- Content -->
		<div class="relative flex h-full flex-col items-center justify-center text-center text-white">
			<h1 class="mb-4 font-serif text-5xl font-bold md:text-7xl lg:text-8xl drop-shadow-lg">
				Vincent & Mélanie
			</h1>
			<p class="font-sans text-lg font-medium uppercase tracking-[0.2em] md:text-xl drop-shadow-md">
				18 Juillet 2026
			</p>
		</div>
	</section>

	<!-- 2. Countdown Section -->
	<section class="bg-stone-50 py-8 md:py-12">
		<div class="container mx-auto px-4">
			<h2 class="mb-6 text-center font-serif text-2xl font-bold text-primary md:text-3xl">
				Le Grand Jour Arrive
			</h2>

			<div class="mx-auto grid max-w-3xl grid-cols-2 gap-3 md:grid-cols-4 md:gap-6">
				{#each Object.entries(timeLeft) as [unit, value] (unit)}
					<div
						class="flex flex-col items-center justify-center rounded-lg bg-stone-200/50 p-4 text-center shadow-sm"
					>
						<span class="font-sans text-4xl font-bold text-foreground md:text-5xl">
							{value.toString().padStart(2, '0')}
						</span>
						<span class="mt-2 font-serif text-sm uppercase tracking-wider text-primary">
							{unit === 'days'
								? 'Jours'
								: unit === 'hours'
									? 'Heures'
									: unit === 'minutes'
										? 'Minutes'
										: 'Secondes'}
						</span>
					</div>
				{/each}
			</div>
		</div>
	</section>

	<!-- 3. Welcome & Actions Section -->
	<section class="bg-stone-50 pb-12 pt-4">
		<div class="container mx-auto max-w-2xl px-4 text-center">
			<h2 class="mb-4 font-serif text-3xl font-bold text-foreground md:text-4xl">
				{firstName ? `Bienvenue, ${firstName}` : 'Bienvenue'}
			</h2>
			<p class="mb-6 text-base leading-relaxed text-muted-foreground md:text-lg">
				Nous sommes ravis de partager ce moment unique avec toi. Explore notre site pour trouver
				toutes les informations nécessaires et n'oublie pas de nous faire part de ta présence.
			</p>

			<div class="flex flex-col items-center justify-center gap-4 sm:flex-row">
				{#if isLoggedIn && hasResponded}
					<Button href="/rsvp" variant="outline" class="h-12 w-full px-8 text-base font-semibold sm:w-auto">
						Voir / Modifier mon RSVP
					</Button>
				{:else}
					<div class="flex flex-col items-center">
						<Button href={isLoggedIn ? '/rsvp' : '/login'} class="h-14 w-full px-10 text-lg font-bold shadow-md sm:w-auto">
							Confirmer Ta Présence
						</Button>
						<span class="mt-2 text-xs text-muted-foreground">Répondre avant le 1er mai</span>
					</div>
				{/if}
				<Button href="/programme" variant="outline" class="h-12 w-full px-8 text-base font-semibold sm:w-auto">
					Programme
				</Button>
				<Button href="/gallery" variant="outline" class="h-12 w-full px-8 text-base font-semibold sm:w-auto">
					Galerie
				</Button>
			</div>
		</div>
	</section>
</div>
