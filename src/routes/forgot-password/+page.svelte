<script lang="ts">
	import { enhance } from '$app/forms';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import * as Card from '$lib/components/ui/card';
	import { Loader2, ArrowLeft, Mail, CheckCircle } from 'lucide-svelte';

	let { form } = $props();
	let isLoading = $state(false);
</script>

<div class="flex min-h-screen items-center justify-center bg-background p-4">
	<Card.Root class="w-full max-w-md">
		<Card.Header class="text-center">
			<Card.Title class="font-serif text-3xl text-primary">Mot de passe oublié</Card.Title>
			<Card.Description>
				Entre ton adresse email pour recevoir un lien de réinitialisation.
			</Card.Description>
		</Card.Header>
		<Card.Content>
			{#if form?.success}
				<div class="flex flex-col items-center gap-4 py-4 text-center">
					<div class="rounded-full bg-primary/10 p-3">
						<CheckCircle class="h-8 w-8 text-primary" />
					</div>
					<div class="space-y-2">
						<p class="font-medium text-foreground">Email envoyé !</p>
						<p class="text-sm text-muted-foreground">
							Si cette adresse est associée à un compte, tu recevras un email avec un lien pour
							réinitialiser ton mot de passe.
						</p>
					</div>
					<a
						href="/login"
						class="mt-4 inline-flex items-center text-sm text-primary hover:underline"
					>
						<ArrowLeft class="mr-2 h-4 w-4" />
						Retour à la connexion
					</a>
				</div>
			{:else}
				{#if form?.error}
					<div class="mb-4 rounded-md bg-destructive/15 p-3 text-sm text-destructive">
						{form.error}
					</div>
				{/if}

				<form
					method="POST"
					class="space-y-4"
					use:enhance={() => {
						isLoading = true;
						return async ({ update }) => {
							isLoading = false;
							await update();
						};
					}}
				>
					<div class="space-y-2">
						<Label for="email">Email</Label>
						<div class="relative">
							<Mail
								class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
							/>
							<Input
								id="email"
								name="email"
								type="email"
								placeholder="toi@exemple.com"
								required
								class="pl-10"
							/>
						</div>
					</div>

					<Button type="submit" class="w-full" disabled={isLoading}>
						{#if isLoading}
							<Loader2 class="mr-2 h-4 w-4 animate-spin" />
						{/if}
						Envoyer le lien de réinitialisation
					</Button>
				</form>
			{/if}
		</Card.Content>
		{#if !form?.success}
			<Card.Footer class="justify-center text-sm text-muted-foreground">
				<a href="/login" class="inline-flex items-center text-primary hover:underline">
					<ArrowLeft class="mr-2 h-4 w-4" />
					Retour à la connexion
				</a>
			</Card.Footer>
		{/if}
	</Card.Root>
</div>
