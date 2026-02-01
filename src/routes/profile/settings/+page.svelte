<script lang="ts">
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import * as Card from '$lib/components/ui/card';
	import { toast } from 'svelte-sonner';
	import { Loader2, Mail, KeyRound, User, Eye, EyeOff } from 'lucide-svelte';

	let { data, form } = $props();

	let isEmailSubmitting = $state(false);
	let isPasswordSubmitting = $state(false);
	let showCurrentPassword = $state(false);
	let showNewPassword = $state(false);
	let showConfirmPassword = $state(false);
</script>

<div class="min-h-screen bg-stone-50 py-12 md:py-24">
	<div class="container mx-auto max-w-2xl px-4">
		<h1 class="mb-8 font-serif text-3xl font-bold text-primary md:text-4xl">Paramètres</h1>

		<!-- Profile Info Section -->
		<Card.Root class="mb-6">
			<Card.Header>
				<div class="flex items-center gap-3">
					<div class="rounded-full bg-primary/10 p-2">
						<User class="h-5 w-5 text-primary" />
					</div>
					<div>
						<Card.Title class="text-lg">Mon profil invité</Card.Title>
						<Card.Description>Ton profil lié : <strong>{data.guest.full_name}</strong></Card.Description>
					</div>
				</div>
			</Card.Header>
			<Card.Content>
				<a
					href="/profile/settings/change-profile"
					class="text-sm text-primary underline hover:text-primary/80"
				>
					Ce n'est pas moi ? Changer de profil
				</a>
			</Card.Content>
		</Card.Root>

		<!-- Email Section -->
		<Card.Root class="mb-6">
			<Card.Header>
				<div class="flex items-center gap-3">
					<div class="rounded-full bg-primary/10 p-2">
						<Mail class="h-5 w-5 text-primary" />
					</div>
					<div>
						<Card.Title class="text-lg">Adresse email</Card.Title>
						<Card.Description>Modifie ton adresse email de connexion.</Card.Description>
					</div>
				</div>
			</Card.Header>
			<Card.Content>
				{#if form?.emailSuccess}
					<div class="mb-4 rounded-md bg-green-50 border border-green-200 p-3 text-sm text-green-800">
						Email mis à jour avec succès.
					</div>
				{/if}
				{#if form?.emailError}
					<div class="mb-4 rounded-md bg-destructive/15 p-3 text-sm text-destructive">
						{form.emailError}
					</div>
				{/if}

				<form
					method="POST"
					action="?/updateEmail"
					use:enhance={() => {
						isEmailSubmitting = true;
						return async ({ result, update }) => {
							isEmailSubmitting = false;
							if (result.type === 'success') {
								toast.success('Email mis à jour !');
								await invalidateAll();
							}
							await update();
						};
					}}
					class="space-y-4"
				>
					<div class="space-y-2">
						<Label for="email">Nouvel email</Label>
						<Input
							id="email"
							name="email"
							type="email"
							value={data.email}
							placeholder="email@exemple.com"
							required
						/>
					</div>
					<Button type="submit" disabled={isEmailSubmitting}>
						{#if isEmailSubmitting}
							<Loader2 class="mr-2 h-4 w-4 animate-spin" />
						{/if}
						Mettre à jour l'email
					</Button>
				</form>
			</Card.Content>
		</Card.Root>

		<!-- Password Section -->
		<Card.Root>
			<Card.Header>
				<div class="flex items-center gap-3">
					<div class="rounded-full bg-primary/10 p-2">
						<KeyRound class="h-5 w-5 text-primary" />
					</div>
					<div>
						<Card.Title class="text-lg">
							{data.isOAuthOnly ? 'Créer un mot de passe' : 'Modifier le mot de passe'}
						</Card.Title>
						<Card.Description>
							{#if data.isOAuthOnly}
								Tu te connectes via Google. Crée un mot de passe pour pouvoir aussi te connecter par email.
							{:else}
								Change ton mot de passe de connexion.
							{/if}
						</Card.Description>
					</div>
				</div>
			</Card.Header>
			<Card.Content>
				{#if form?.passwordSuccess}
					<div class="mb-4 rounded-md bg-green-50 border border-green-200 p-3 text-sm text-green-800">
						Mot de passe {data.isOAuthOnly ? 'créé' : 'mis à jour'} avec succès.
					</div>
				{/if}
				{#if form?.passwordError}
					<div class="mb-4 rounded-md bg-destructive/15 p-3 text-sm text-destructive">
						{form.passwordError}
					</div>
				{/if}

				<form
					method="POST"
					action={data.isOAuthOnly ? '?/createPassword' : '?/updatePassword'}
					use:enhance={() => {
						isPasswordSubmitting = true;
						return async ({ result, update }) => {
							isPasswordSubmitting = false;
							if (result.type === 'success') {
								toast.success(data.isOAuthOnly ? 'Mot de passe créé !' : 'Mot de passe mis à jour !');
							}
							await update();
						};
					}}
					class="space-y-4"
				>
					{#if !data.isOAuthOnly}
						<div class="space-y-2">
							<Label for="currentPassword">Ancien mot de passe</Label>
							<div class="relative">
								<Input
									id="currentPassword"
									name="currentPassword"
									type={showCurrentPassword ? 'text' : 'password'}
									placeholder="••••••••"
									required
									class="pr-10"
								/>
								<button
									type="button"
									class="absolute right-0 top-0 flex h-full w-10 items-center justify-center text-muted-foreground hover:text-foreground"
									onclick={() => (showCurrentPassword = !showCurrentPassword)}
									tabindex={-1}
								>
									{#if showCurrentPassword}
										<EyeOff class="h-4 w-4" />
									{:else}
										<Eye class="h-4 w-4" />
									{/if}
								</button>
							</div>
						</div>
					{/if}

					<div class="space-y-2">
						<Label for="newPassword">Nouveau mot de passe</Label>
						<div class="relative">
							<Input
								id="newPassword"
								name="newPassword"
								type={showNewPassword ? 'text' : 'password'}
								placeholder="••••••••"
								required
								class="pr-10"
							/>
							<button
								type="button"
								class="absolute right-0 top-0 flex h-full w-10 items-center justify-center text-muted-foreground hover:text-foreground"
								onclick={() => (showNewPassword = !showNewPassword)}
								tabindex={-1}
							>
								{#if showNewPassword}
									<EyeOff class="h-4 w-4" />
								{:else}
									<Eye class="h-4 w-4" />
								{/if}
							</button>
						</div>
						<p class="text-xs text-muted-foreground">Minimum 8 caractères avec au moins 1 chiffre</p>
					</div>

					<div class="space-y-2">
						<Label for="confirmPassword">Confirmer le mot de passe</Label>
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
								tabindex={-1}
							>
								{#if showConfirmPassword}
									<EyeOff class="h-4 w-4" />
								{:else}
									<Eye class="h-4 w-4" />
								{/if}
							</button>
						</div>
					</div>

					<Button type="submit" disabled={isPasswordSubmitting}>
						{#if isPasswordSubmitting}
							<Loader2 class="mr-2 h-4 w-4 animate-spin" />
						{/if}
						{data.isOAuthOnly ? 'Créer un mot de passe' : 'Mettre à jour le mot de passe'}
					</Button>
				</form>
			</Card.Content>
		</Card.Root>
	</div>
</div>
