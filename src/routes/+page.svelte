<script lang="ts">
	import { onMount } from 'svelte';
	import { Button } from '$lib/components/ui/button';
	import { CalendarCheck, Image } from 'lucide-svelte';

	let { data } = $props();

	const userName = data.session?.user?.user_metadata?.full_name?.split(' ')[0] ?? null;

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
	<section class="relative h-[60vh] min-h-[500px] w-full overflow-hidden">
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
	<section class="bg-stone-50 py-16 md:py-24">
		<div class="container mx-auto px-4">
			<h2 class="mb-12 text-center font-serif text-3xl font-bold text-primary md:text-4xl">
				Le Grand Jour Arrive
			</h2>

			<div class="mx-auto grid max-w-3xl grid-cols-2 gap-4 md:grid-cols-4 md:gap-8">
				{#each Object.entries(timeLeft) as [unit, value]}
					<div
						class="flex flex-col items-center justify-center rounded-lg bg-stone-200/50 p-6 text-center shadow-sm"
					>
						<span class="font-sans text-4xl font-bold text-stone-800 md:text-5xl">
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
	<section class="bg-stone-50 pb-24 pt-8">
		<div class="container mx-auto max-w-2xl px-4 text-center">
			<h2 class="mb-6 font-serif text-4xl font-bold text-stone-900 md:text-5xl">
				Bienvenue {userName ? `, ${userName}` : ''}
			</h2>
			<p class="mb-10 text-lg leading-relaxed text-stone-600">
				Nous sommes ravis de partager ce moment unique avec vous. Explorez notre site pour trouver
				toutes les informations nécessaires et n'oubliez pas de nous faire part de votre présence.			</p>

			<div class="flex flex-col items-center justify-center gap-4 sm:flex-row">
				<Button
					href="/rsvp"
					class="h-12 w-full bg-sage-600 px-8 text-base font-semibold text-white hover:bg-sage-700 sm:w-auto"
				>
					Confirmer Votre Présence (RSVP)
				</Button>
				<Button
					href="/gallery"
					variant="outline"
					class="h-12 w-full border-stone-300 px-8 text-base font-semibold text-stone-700 hover:bg-stone-100 sm:w-auto"
				>
					Partagez Vos Souvenirs (Galerie)
				</Button>
			</div>
		</div>
	</section>
</div>
