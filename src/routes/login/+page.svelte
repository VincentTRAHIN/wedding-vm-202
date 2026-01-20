<script lang="ts">
	import { enhance } from '$app/forms';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import * as Card from '$lib/components/ui/card';
	import { toast } from 'svelte-sonner';
	import { Loader2, Eye, EyeOff } from 'lucide-svelte';

	let isLoadingGoogle = $state(false);
	let isLoadingMagic = $state(false);
	let showPassword = $state(false);
</script>

<div class="flex min-h-screen items-center justify-center bg-background p-4">
	<Card.Root class="w-full max-w-md">
		<Card.Header class="text-center">
			<Card.Title class="font-serif text-3xl text-primary">V&M 2026</Card.Title>
			<Card.Description>Connecte-toi pour accéder à l'espace invités</Card.Description>
		</Card.Header>
		<Card.Content class="space-y-6">
			<form
				action="?/login_google"
				method="POST"
				use:enhance={() => {
					isLoadingGoogle = true;
					return async ({ update }) => {
						isLoadingGoogle = false;
						await update();
					};
				}}
			>
				<Button variant="outline" class="w-full" type="submit" disabled={isLoadingGoogle}>
					{#if isLoadingGoogle}
						<Loader2 class="mr-2 h-4 w-4 animate-spin" />
					{:else}
						<svg class="mr-2 h-4 w-4" viewBox="0 0 24 24">
							<path
								d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
								fill="#4285F4"
							/>
							<path
								d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
								fill="#34A853"
							/>
							<path
								d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
								fill="#FBBC05"
							/>
							<path
								d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
								fill="#EA4335"
							/>
						</svg>
					{/if}
					Continuer avec Google
				</Button>
			</form>

			<div class="relative">
				<div class="absolute inset-0 flex items-center">
					<span class="w-full border-t"></span>
				</div>
				<div class="relative flex justify-center text-xs uppercase">
					<span class="bg-background px-2 text-muted-foreground">Ou par email</span>
				</div>
			</div>

			<form
				action="?/login_password"
				method="POST"
				class="space-y-4"
				use:enhance={() => {
					isLoadingMagic = true;
					return async ({ result, update }) => {
						isLoadingMagic = false;
						if (result.type === 'failure') {
							toast.error('Email ou mot de passe incorrect.');
						}
						await update();
					};
				}}
			>
				<div class="space-y-2">
					<Label for="email">Email</Label>
					<Input
						id="email"
						name="email"
						type="email"
						placeholder="toi@exemple.com"
						required
						disabled={isLoadingMagic}
					/>
				</div>
				<div class="space-y-2">
					<Label for="password">Mot de passe</Label>
					<div class="relative">
						<Input
							id="password"
							name="password"
							type={showPassword ? 'text' : 'password'}
							placeholder="••••••••"
							required
							disabled={isLoadingMagic}
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
				</div>
				<Button type="submit" class="w-full" disabled={isLoadingMagic}>
					{#if isLoadingMagic}
						<Loader2 class="mr-2 h-4 w-4 animate-spin" />
					{/if}
					Te connecter
				</Button>
			</form>
			<div class="text-center text-sm space-y-2">
				<a href="/forgot-password" class="text-muted-foreground hover:text-primary hover:underline">
					Mot de passe oublié ?
				</a>
				<div>
					<a href="/register" class="text-primary hover:underline">
						Pas encore de compte ? T'inscrire
					</a>
				</div>
			</div>
		</Card.Content>
		<Card.Footer class="justify-center text-sm text-muted-foreground">
			Problème de connexion ? Contacte les mariés.
		</Card.Footer>
	</Card.Root>
</div>
