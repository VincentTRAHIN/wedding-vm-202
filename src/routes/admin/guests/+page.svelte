<script lang="ts">
	import { enhance } from '$app/forms';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import * as Table from '$lib/components/ui/table';
	import * as Card from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import { toast } from 'svelte-sonner';
	import { Plus, Loader2, AlertTriangle } from 'lucide-svelte';

	let { data, form } = $props();
	let { guests } = $derived(data);

	let isAdding = $state(false);
</script>

<div class="grid gap-8 lg:grid-cols-3">
	<!-- Add Guest Form -->
	<Card.Root class="h-fit lg:col-span-1">
		<Card.Header>
			<Card.Title>Ajouter un invité</Card.Title>
			<Card.Description>Ajoutez un email à la liste blanche.</Card.Description>
		</Card.Header>
		<Card.Content>
			<form
				method="POST"
				action="?/add"
				use:enhance={() => {
					isAdding = true;
					return async ({ result, update }) => {
						isAdding = false;
						if (result.type === 'success') {
							toast.success('Invité ajouté avec succès !');
						} else if (result.type === 'failure') {
							// eslint-disable-next-line @typescript-eslint/no-explicit-any
							toast.error((result.data as any)?.message || "Erreur lors de l'ajout.");
						}
						await update();
					};
				}}
				class="space-y-4"
			>
				<div class="space-y-2">
					<Label for="email">Email</Label>
					<Input type="email" id="email" name="email" placeholder="email@exemple.com" required />
				</div>
				<div class="space-y-2">
					<Label for="full_name">Nom complet (optionnel)</Label>
					<Input type="text" id="full_name" name="full_name" placeholder="Jean Dupont" />
				</div>
				<div class="space-y-2">
					<Label for="expected_count">Nombre attendu</Label>
					<Input type="number" id="expected_count" name="expected_count" value="1" min="1" />
				</div>
				<Button type="submit" class="w-full" disabled={isAdding}>
					{#if isAdding}
						<Loader2 class="mr-2 h-4 w-4 animate-spin" />
					{:else}
						<Plus class="mr-2 h-4 w-4" />
					{/if}
					Ajouter
				</Button>
			</form>
		</Card.Content>
	</Card.Root>

	<!-- Guest List -->
	<Card.Root class="lg:col-span-2">
		<Card.Header>
			<Card.Title>Liste des invités ({guests.length})</Card.Title>
		</Card.Header>
		<Card.Content>
			<Table.Root>
				<Table.Header>
					<Table.Row>
						<Table.Head>Nom / Email</Table.Head>
						<Table.Head>Statut</Table.Head>
						<Table.Head class="text-right">Total</Table.Head>
					</Table.Row>
				</Table.Header>
				<Table.Body>
					{#each guests as guest}
						<Table.Row>
							<Table.Cell>
								<div class="font-medium">{guest.full_name || 'Sans nom'}</div>
								<div class="text-xs text-muted-foreground">{guest.email}</div>
							</Table.Cell>
							<Table.Cell>
								{#if guest.rsvp_status === 'present'}
									<Badge variant="default" class="bg-green-600 hover:bg-green-700">Présent</Badge>
								{:else if guest.rsvp_status === 'absent'}
									<Badge variant="destructive">Absent</Badge>
								{:else}
									<Badge variant="secondary">En attente</Badge>
								{/if}
							</Table.Cell>
							<Table.Cell class="text-right">
								{#if guest.rsvp_status === 'present'}
									{@const total = (guest.adults_count || 0) + (guest.children_count || 0)}
									<div class="flex items-center justify-end gap-2">
										<span>{total}</span>
										{#if total > guest.expected_count}
											<div title={`Attendu: ${guest.expected_count}`}>
												<AlertTriangle class="h-4 w-4 text-yellow-500" />
											</div>
										{/if}
									</div>
								{:else}
									-
								{/if}
							</Table.Cell>
						</Table.Row>
					{/each}
				</Table.Body>
			</Table.Root>
		</Card.Content>
	</Card.Root>
</div>
