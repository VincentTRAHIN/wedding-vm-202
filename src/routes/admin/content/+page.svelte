<script lang="ts">
	import { enhance } from '$app/forms';
	import { Button } from '$lib/components/ui/button';
	import { Label } from '$lib/components/ui/label';
	import { Textarea } from '$lib/components/ui/textarea';
	import * as Card from '$lib/components/ui/card';
	import { toast } from 'svelte-sonner';
	import { Loader2 } from 'lucide-svelte';

	let { data } = $props();
	let { content } = $derived(data);

	let isSubmitting = $state(false);
</script>

<div class="space-y-8">
	<h1 class="text-3xl font-bold">Gestion du Contenu</h1>

	{#each content as item (item.key)}
		<Card.Root>
			<Card.Header>
				<Card.Title>{item.key}</Card.Title>
				<Card.Description>Page: {item.page || 'Global'}</Card.Description>
			</Card.Header>
			<Card.Content>
				<form
					method="POST"
					action="?/update"
					use:enhance={() => {
						isSubmitting = true;
						return async ({ result, update }) => {
							isSubmitting = false;
							if (result.type === 'success') {
								toast.success('Contenu mis à jour !');
							} else {
								toast.error('Erreur lors de la mise à jour.');
							}
							await update();
						};
					}}
					class="space-y-4"
				>
					<input type="hidden" name="key" value={item.key} />
					<div class="space-y-2">
						<Label for="content_{item.key}">Contenu JSON</Label>
						<Textarea
							id="content_{item.key}"
							name="content"
							value={JSON.stringify(item.content, null, 2)}
							rows={15}
							class="font-mono text-sm"
						/>
					</div>
					<Button type="submit" disabled={isSubmitting}>
						{#if isSubmitting}
							<Loader2 class="mr-2 h-4 w-4 animate-spin" />
						{/if}
						Enregistrer
					</Button>
				</form>
			</Card.Content>
		</Card.Root>
	{/each}
</div>
