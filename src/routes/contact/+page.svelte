<script lang="ts">
	import { enhance } from '$app/forms';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Textarea } from '$lib/components/ui/textarea';
	import * as Card from '$lib/components/ui/card';
	import { toast } from 'svelte-sonner';
	import { Loader2, Send, MessageCircle } from 'lucide-svelte';

	let isSubmitting = $state(false);
	let formElement: HTMLFormElement;
</script>

<div class="min-h-screen bg-stone-50 py-12 md:py-24">
	<div class="container mx-auto max-w-2xl px-4">
		<div class="mb-12 text-center">
			<div
				class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10"
			>
				<MessageCircle class="h-8 w-8 text-primary" />
			</div>
			<h1 class="mb-4 font-serif text-4xl font-bold text-primary md:text-5xl">Contacte-nous</h1>
			<p class="text-lg text-muted-foreground">
				Une question ? Un souci ? On est là pour toi ! (Et promis, on répond... en général.)
			</p>
		</div>

		<Card.Root>
			<Card.Content class="pt-6">
				<form
					bind:this={formElement}
					method="POST"
					action="?/send"
					use:enhance={() => {
						isSubmitting = true;
						return async ({ result, update }) => {
							isSubmitting = false;
							if (result.type === 'success') {
								toast.success('Message envoyé avec succès ! On te répond très vite.');
								formElement?.reset();
							} else if (result.type === 'failure') {
								toast.error("Erreur lors de l'envoi du message.");
							}
							await update();
						};
					}}
					class="space-y-6"
				>
					<div class="space-y-2">
						<Label for="name">Ton nom <span class="text-red-500">*</span></Label>
						<Input
							type="text"
							id="name"
							name="name"
							placeholder="Jean Dupont"
							required
							disabled={isSubmitting}
						/>
					</div>

					<div class="space-y-2">
						<Label for="email">Ton email <span class="text-red-500">*</span></Label>
						<Input
							type="email"
							id="email"
							name="email"
							placeholder="jean.dupont@example.com"
							required
							disabled={isSubmitting}
						/>
						<p class="text-xs text-muted-foreground">
							Pour qu'on puisse te répondre (promis, pas de spam).
						</p>
					</div>

					<div class="space-y-2">
						<Label for="subject">Sujet <span class="text-red-500">*</span></Label>
						<Input
							type="text"
							id="subject"
							name="subject"
							placeholder="Besoin d'aide avec..."
							required
							disabled={isSubmitting}
						/>
					</div>

					<div class="space-y-2">
						<Label for="message">Message <span class="text-red-500">*</span></Label>
						<Textarea
							id="message"
							name="message"
							placeholder="Dis-nous tout !"
							rows={6}
							required
							disabled={isSubmitting}
							class="resize-none"
						/>
						<p class="text-xs text-muted-foreground">Minimum 10 caractères (sois bavard !).</p>
					</div>

					<Button type="submit" class="w-full" disabled={isSubmitting}>
						{#if isSubmitting}
							<Loader2 class="mr-2 h-4 w-4 animate-spin" />
							Envoi en cours...
						{:else}
							<Send class="mr-2 h-4 w-4" />
							Envoyer le message
						{/if}
					</Button>
				</form>
			</Card.Content>
		</Card.Root>

		<div class="mt-8 text-center text-sm text-muted-foreground">
			<p>
				💡 Pense aussi à vérifier la <a href="/faq" class="underline hover:text-foreground">FAQ</a>,
				ta réponse y est peut-être déjà !
			</p>
		</div>
	</div>
</div>
