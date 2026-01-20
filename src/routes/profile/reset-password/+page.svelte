<script lang="ts">
	import { enhance } from '$app/forms';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import * as Card from '$lib/components/ui/card';
	import { Loader2, Eye, EyeOff, KeyRound } from 'lucide-svelte';

	let { form } = $props();
	let isLoading = $state(false);
	let showPassword = $state(false);
	let showConfirmPassword = $state(false);
</script>

<div class="flex min-h-screen items-center justify-center bg-background p-4">
	<Card.Root class="w-full max-w-md">
		<Card.Header class="text-center">
			<div class="mx-auto mb-4 rounded-full bg-primary/10 p-3">
				<KeyRound class="h-8 w-8 text-primary" />
			</div>
			<Card.Title class="font-serif text-3xl text-primary">Nouveau mot de passe</Card.Title>
			<Card.Description>Choisis un nouveau mot de passe pour ton compte.</Card.Description>
		</Card.Header>
		<Card.Content>
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
					<Label for="password">Nouveau mot de passe</Label>
					<div class="relative">
						<Input
							id="password"
							name="password"
							type={showPassword ? 'text' : 'password'}
							placeholder="••••••••"
							required
							class="pr-10"
						/>
						<button
							type="button"
							class="absolute right-0 top-0 flex h-full w-10 items-center justify-center text-muted-foreground hover:text-foreground"
							onclick={() => (showPassword = !showPassword)}
							tabindex="-1"
						>
							{#if showPassword}
								<EyeOff class="h-4 w-4" />
							{:else}
								<Eye class="h-4 w-4" />
							{/if}
							<span class="sr-only">{showPassword ? 'Masquer' : 'Afficher'} le mot de passe</span>
						</button>
					</div>
					<p class="text-xs text-muted-foreground">Minimum 8 caractères avec au moins 1 chiffre</p>
				</div>

				<div class="space-y-2">
					<Label for="confirmPassword">Confirme ton nouveau mot de passe</Label>
					<div class="relative">
						<Input
							id="confirmPassword"
							name="confirmPassword"
							type={showConfirmPassword ? 'text' : 'password'}
							placeholder="••••••••"
							required
							class="pr-10"
						/>
						<button
							type="button"
							class="absolute right-0 top-0 flex h-full w-10 items-center justify-center text-muted-foreground hover:text-foreground"
							onclick={() => (showConfirmPassword = !showConfirmPassword)}
							tabindex="-1"
						>
							{#if showConfirmPassword}
								<EyeOff class="h-4 w-4" />
							{:else}
								<Eye class="h-4 w-4" />
							{/if}
							<span class="sr-only">{showConfirmPassword ? 'Masquer' : 'Afficher'}</span>
						</button>
					</div>
				</div>

				<Button type="submit" class="w-full" disabled={isLoading}>
					{#if isLoading}
						<Loader2 class="mr-2 h-4 w-4 animate-spin" />
					{/if}
					Mettre à jour mon mot de passe
				</Button>
			</form>
		</Card.Content>
	</Card.Root>
</div>
