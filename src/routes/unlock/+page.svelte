<script lang="ts">
	import { enhance } from '$app/forms';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import * as Card from '$lib/components/ui/card';
	import { Lock } from 'lucide-svelte';

	let { form } = $props();
</script>

<div class="flex min-h-screen items-center justify-center bg-stone-50 p-4">
	<Card.Root class="w-full max-w-md shadow-lg">
		<Card.Header class="text-center">
			<div class="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
				<Lock class="h-6 w-6 text-primary" />
			</div>
			<Card.Title class="text-2xl font-serif">V&M 2026</Card.Title>
			<Card.Description>
				Espace Privé. Veuillez entrer le code d'accès présent sur votre invitation.
			</Card.Description>
		</Card.Header>
		<Card.Content>
			<form method="POST" use:enhance class="space-y-4">
				<div class="space-y-2">
					<Label for="code">Code d'accès</Label>
					<Input
						type="password"
						id="code"
						name="code"
						placeholder="Entrez le code..."
						required
						class="text-center text-lg tracking-widest"
					/>
				</div>
				{#if form?.error}
					<p class="text-sm font-medium text-destructive text-center">{form.error}</p>
				{/if}
				<Button type="submit" class="w-full">Entrer</Button>
			</form>
		</Card.Content>
	</Card.Root>
</div>
