<script lang="ts">
	import { page } from '$app/stores';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import { AlertTriangle, Home } from 'lucide-svelte';
</script>

<div class="flex min-h-screen items-center justify-center bg-background p-4">
	<Card.Root class="w-full max-w-md text-center">
		<Card.Header>
			<div
				class="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10"
			>
				<AlertTriangle class="h-6 w-6 text-destructive" />
			</div>
			<Card.Title class="text-2xl font-bold">Oups ! Une erreur est survenue</Card.Title>
			<Card.Description>
				{#if $page.status === 404}
					La page que vous recherchez n'existe pas.
				{:else}
					Une erreur inattendue s'est produite.
				{/if}
			</Card.Description>
		</Card.Header>
		<Card.Content>
			<p class="text-sm text-muted-foreground">
				Code d'erreur : {$page.status}
				{#if $page.error?.message}
					<br />
					{$page.error.message}
				{/if}
			</p>
		</Card.Content>
		<Card.Footer class="justify-center">
			<Button href="/" variant="default">
				<Home class="mr-2 h-4 w-4" />
				Retour à l'accueil
			</Button>
		</Card.Footer>
	</Card.Root>
</div>
