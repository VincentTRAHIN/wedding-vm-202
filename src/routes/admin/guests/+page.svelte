<script lang="ts">
	import { enhance } from '$app/forms';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import * as Table from '$lib/components/ui/table';
	import * as Card from '$lib/components/ui/card';
	import { Checkbox } from '$lib/components/ui/checkbox';
	import { Badge } from '$lib/components/ui/badge';
	import { toast } from 'svelte-sonner';
	import { Plus, Loader2, ArrowUpDown, Link } from 'lucide-svelte';
	import EditGuestDialog from './EditGuestDialog.svelte';
	import DeleteGuestDialog from './DeleteGuestDialog.svelte';

	let { data } = $props();
	let { guests, rooms } = $derived(data);

	let isAdding = $state(false);
	let isChild = $state(false);

	// Sorting state
	type SortColumn = 'full_name' | 'rsvp_status';
	let sortColumn = $state<SortColumn>('full_name');
	let sortDirection = $state<'asc' | 'desc'>('asc');

	let searchQuery = $state('');

	function toggleSort(column: SortColumn) {
		if (sortColumn === column) {
			sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
		} else {
			sortColumn = column;
			sortDirection = 'asc';
		}
	}

	let sortedGuests = $derived(
		guests
			.filter((g: (typeof guests)[0]) => {
				const q = searchQuery.toLowerCase();
				return (
					(g.full_name || '').toLowerCase().includes(q) || (g.email || '').toLowerCase().includes(q)
				);
			})
			.sort((a: (typeof guests)[0], b: (typeof guests)[0]) => {
				const modifier = sortDirection === 'asc' ? 1 : -1;
				if (sortColumn === 'full_name') {
					return (a.full_name || '').localeCompare(b.full_name || '') * modifier;
				} else if (sortColumn === 'rsvp_status') {
					const statusA = a.rsvp_status || '';
					const statusB = b.rsvp_status || '';
					return statusA.localeCompare(statusB) * modifier;
				}
				return 0;
			})
	);
</script>

<div class="grid gap-8 lg:grid-cols-3">
	<!-- Add Guest Form -->
	<Card.Root class="h-fit lg:col-span-1">
		<Card.Header>
			<Card.Title>Ajouter un invité</Card.Title>
			<Card.Description>Ajoutez un invité à la liste.</Card.Description>
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
							isChild = false;
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
					<Label for="full_name">Nom complet <span class="text-red-500">*</span></Label>
					<Input type="text" id="full_name" name="full_name" placeholder="Jean Dupont" required />
				</div>

				<div class="space-y-2">
					<Label for="email">Email (optionnel)</Label>
					<Input type="email" id="email" name="email" placeholder="email@exemple.com" />
					<p class="text-xs text-muted-foreground">
						Laisser vide si l'invité n'a pas d'email (ex: enfant).
					</p>
				</div>

				<div class="flex items-center space-x-2">
					<Checkbox id="is_child" bind:checked={isChild} name="is_child" />
					<Label
						for="is_child"
						class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
					>
						Cet invité est un enfant (-18 ans)
					</Label>
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
			<div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<Card.Title>Liste des invités ({sortedGuests.length})</Card.Title>
				<div class="relative w-full sm:w-64">
					<Input type="search" placeholder="Rechercher un invité..." bind:value={searchQuery} />
				</div>
			</div>
		</Card.Header>
		<Card.Content>
			<Table.Root>
				<Table.Header>
					<Table.Row>
						<Table.Head>
							<Button variant="ghost" onclick={() => toggleSort('full_name')} class="-ml-4">
								Nom / Email
								<ArrowUpDown class="ml-2 h-4 w-4" />
							</Button>
						</Table.Head>
						<Table.Head>Validé par</Table.Head>
						<Table.Head>
							<Button variant="ghost" onclick={() => toggleSort('rsvp_status')} class="-ml-4">
								Statut
								<ArrowUpDown class="ml-2 h-4 w-4" />
							</Button>
						</Table.Head>
						<Table.Head class="w-[50px]"></Table.Head>
					</Table.Row>
				</Table.Header>
				<Table.Body>
					{#each sortedGuests as guest (guest.id)}
						<Table.Row>
							<Table.Cell>
								<div class="flex items-center gap-2">
									<div class="font-medium">{guest.full_name || 'Sans nom'}</div>
									{#if guest.auth_id}
										<span title="Compte lié">
											<Link class="h-3 w-3 text-blue-500" />
										</span>
									{/if}
									{#if guest.is_child}
										<Badge variant="outline" class="text-[10px] h-5 px-1.5">Enfant</Badge>
									{/if}
								</div>
								{#if guest.email}
									<div class="text-xs text-muted-foreground">{guest.email}</div>
								{/if}
							</Table.Cell>
							<Table.Cell>
								{#if guest.managed_by}
									<Badge variant="secondary" class="font-normal text-xs">
										via {guest.managed_by.full_name}
									</Badge>
								{:else}
									<span class="text-muted-foreground">-</span>
								{/if}
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
							<Table.Cell>
								<div class="flex items-center gap-2">
									<EditGuestDialog {guest} {rooms} />
									<DeleteGuestDialog {guest} />
								</div>
							</Table.Cell>
						</Table.Row>
					{/each}
				</Table.Body>
			</Table.Root>
		</Card.Content>
	</Card.Root>
</div>
