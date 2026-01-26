<script lang="ts">
	let openIndex = $state<number | null>(null);

	function toggle(index: number) {
		openIndex = openIndex === index ? null : index;
	}

	const faqs = [
		{
			question: 'Où se déroule le mariage ?',
			answer:
				'Le mariage aura lieu au Château des Landes à Cléré-sur-Layon, dans le Maine-et-Loire. Tu trouveras toutes les infos GPS dans ton dashboard !'
		},
		{
			question: 'À quelle heure dois-je arriver ?',
			answer:
				"Les portes ouvrent à 15h00, et la cérémonie commence à 15h30. On te conseille d'arriver un peu en avance pour profiter du jardin d'honneur et te poser tranquillement."
		},
		{
			question: 'Y a-t-il un dress code ?',
			answer: "Pas de dress code imposé ! Mais c'est un mariage quand même , donc évites les tongs!"
		},
		{
			question: 'Puis-je venir accompagné(e) ?',
			answer:
				"Les invitations sont nominatives. Si tu veux venir accompagné(e) et que ce n'était pas prévu, contacte-nous via la page Contact et on verra ce qu'on peut faire !"
		},
		{
			question: 'Y aura-t-il de la place pour dormir sur place ?',
			answer:
				"Oui ! On a des chambres au domaine. Vérifie ton dashboard pour voir si tu en as une d'assignée. Si ce n'est pas le cas et que tu veux rester sur place, contacte-nous vite !"
		},
		{
			question: 'Puis-je prendre des photos et les partager ?',
			answer:
				"Bien sûr ! On a même créé une galerie photo dans l'app pour que tout le monde puisse partager ses meilleurs clichés. N'hésite pas à uploader tes photos du week-end !"
		},
		{
			question: 'Comment ça marche pour le repas ?',
			answer:
				'Le dîner commence à 20h sous le chapiteau. Si tu as des restrictions alimentaires, assure-toi de les avoir renseignées dans ton RSVP. Sinon, contacte-nous rapidement !'
		},
		{
			question: 'Et le lendemain ?',
			answer:
				'On organise un déjeuner avec des fouées à partir de 12h le Dimanche (tu peux quand même venir un peu avant si tu veux prendre un petit café), avec des jeux en tout genre (société, plein air, Cornhole...). Et à 21h, on se retrouve au bar pour la Finale de la Coupe du Monde. Allez les Bleus ! 🇫🇷'
		},
		{
			question: "Je n'ai pas reçu mon invitation par email ?",
			answer:
				'Vérifie tes spams en premier ! Si tu ne trouves rien, contacte-nous via la page Contact avec ton nom complet et on te renvoie tout ça.'
		},
		{
			question: 'Puis-je modifier mon RSVP ?',
			answer:
				"Oui, tu peux modifier ta réponse à tout moment via la page RSVP de ton dashboard. Si tu as un souci, n'hésite pas à nous contacter."
		}
	];
</script>

<div class="min-h-screen bg-stone-50 py-12 md:py-24">
	<div class="container mx-auto max-w-4xl px-4">
		<div class="mb-12 text-center">
			<h1 class="mb-4 font-serif text-4xl font-bold text-primary md:text-5xl">
				Questions Fréquentes
			</h1>
			<p class="text-lg text-muted-foreground">
				On a essayé de penser à tout, mais si tu ne trouves pas ta réponse ici, n'hésite pas à nous
				contacter !
			</p>
		</div>

		<div class="space-y-4">
			{#each faqs as faq, i (i)}
				<div class="rounded-lg border border-stone-200 bg-white overflow-hidden">
					<button
						type="button"
						onclick={() => toggle(i)}
						class="w-full px-6 py-4 text-left font-medium hover:bg-stone-50 transition-colors flex items-center justify-between"
					>
						<span>{faq.question}</span>
						<svg
							class="h-5 w-5 transition-transform {openIndex === i ? 'rotate-180' : ''}"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M19 9l-7 7-7-7"
							/>
						</svg>
					</button>
					{#if openIndex === i}
						<div class="px-6 pb-4 pt-2 text-muted-foreground">
							{faq.answer}
						</div>
					{/if}
				</div>
			{/each}
		</div>

		<div class="mt-12 rounded-lg border border-stone-200 bg-white p-6 text-center">
			<p class="text-muted-foreground">Tu n'as pas trouvé la réponse à ta question ?</p>
			<a
				href="/contact"
				class="mt-4 inline-block rounded-md bg-primary px-6 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
			>
				Contacte-nous
			</a>
		</div>
	</div>
</div>
