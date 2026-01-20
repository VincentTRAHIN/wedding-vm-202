<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
</script>

<div class="flex min-h-screen items-center justify-center bg-background p-4">
	<Card.Root class="w-full max-w-md text-center">
		<Card.Header>
			<Card.Title class="text-2xl font-serif text-primary">Accès Refusé</Card.Title>
			<Card.Description>Désolé, ton email ne figure pas sur la liste des invités.</Card.Description>
		</Card.Header>
		<Card.Content>
			<p class="text-muted-foreground mb-4">
				Si tu penses qu'il s'agit d'une erreur, contacte les mariés.
			</p>
		</Card.Content>
		<Card.Footer class="flex justify-center">
			<Button href="/logout" variant="outline">Se déconnecter</Button>
		</Card.Footer>
	</Card.Root>
</div>
