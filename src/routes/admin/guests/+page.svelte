<script lang="ts">
	import { SvelteSet } from 'svelte/reactivity';
	import { enhance } from '$app/forms';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import * as Table from '$lib/components/ui/table';
	import * as Card from '$lib/components/ui/card';
	import * as Dialog from '$lib/components/ui/dialog';
	import { Checkbox } from '$lib/components/ui/checkbox';
	import { Badge } from '$lib/components/ui/badge';
	import { toast } from 'svelte-sonner';
	import { Plus, Loader2, ArrowUpDown, Link, Info, Users, Wine, Utensils, Heart } from 'lucide-svelte';
	import EditGuestDialog from './EditGuestDialog.svelte';
	import DeleteGuestDialog from './DeleteGuestDialog.svelte';
	import ViewDetailsDialog from './ViewDetailsDialog.svelte';

	let { data } = $props();
	let { guests, rooms } = $derived(data);

	let isAdding = $state(false);
	let isChild = $state(false);
	let isBulkUpdating = $state(false);
	let showAddDialog = $state(false);

	// Bulk selection state
	let selectedGuestIds = new SvelteSet<string>();
	let bulkInvitationType = $state<'complet' | 'vin_honneur'>('complet');

	function toggleGuestSelection(guestId: string) {
		if (selectedGuestIds.has(guestId)) {
			selectedGuestIds.delete(guestId);
		} else {
			selectedGuestIds.add(guestId);
		}
	}

	function clearSelection() {
		selectedGuestIds.clear();
	}

	let hasSelection = $derived(selectedGuestIds.size > 0);

	// Sorting state
	type SortColumn = 'full_name' | 'rsvp_status';
	let sortColumn = $state<SortColumn>('full_name');
	let sortDirection = $state<'asc' | 'desc'>('asc');

	let searchQuery = $state('');
	let typeFilter = $state<'all' | 'complet' | 'vin_honneur'>('all');

	// Counters
	let counters = $derived(() => {
		const total = guests.length;
		const complet = guests.filter((g: (typeof guests)[0]) => g.invitation_type === 'complet' || !g.invitation_type).length;
		const vinHonneur = guests.filter((g: (typeof guests)[0]) => g.invitation_type === 'vin_honneur').length;
		const present = guests.filter((g: (typeof guests)[0]) => g.rsvp_status === 'present').length;
		const absent = guests.filter((g: (typeof guests)[0]) => g.rsvp_status === 'absent').length;
		const pending = guests.filter((g: (typeof guests)[0]) => !g.rsvp_status || g.rsvp_status === 'pending').length;

		// Par evenement
		const ceremonie = guests.filter((g: (typeof guests)[0]) => g.rsvp_status === 'present' && g.present_saturday).length;
		const vinHonneurEvt = ceremonie + guests.filter((g: (typeof guests)[0]) => g.invitation_type === 'vin_honneur' && g.rsvp_status === 'present').length;
		const diner = guests.filter((g: (typeof guests)[0]) => g.rsvp_status === 'present' && g.present_saturday && (g.invitation_type === 'complet' || !g.invitation_type)).length;
		const brunch = guests.filter((g: (typeof guests)[0]) => g.rsvp_status === 'present' && g.present_sunday).length;

		return { total, complet, vinHonneur, present, absent, pending, ceremonie, vinHonneurEvt, diner, brunch };
	});

	function toggleSort(column: SortColumn) {
		if (sortColumn === column) {
			sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
		} else {
			sortColumn = column;
			sortDirection = 'asc';
		}
	}

	function normalizeString(str: string): string {
		return str
			.normalize('NFD')
			.replace(/[\u0300-\u036f]/g, '')
			.toLowerCase();
	}

	let sortedGuests = $derived(
		guests
			.filter((g: (typeof guests)[0]) => {
				const q = normalizeString(searchQuery);
				const name = normalizeString(g.full_name || '');
				const email = normalizeString(g.email || '');
				const matchesSearch = name.includes(q) || email.includes(q);
				const matchesType = typeFilter === 'all' || (g.invitation_type || 'complet') === typeFilter;
				return matchesSearch && matchesType;
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

	function hasDetails(guest: (typeof guests)[0]) {
		return !!guest.dietary_restrictions || !!guest.message_for_couple;
	}
</script>

<div class="space-y-6">
	<!-- Summary Cards Row -->
	<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
		<!-- Total & RSVP Status -->
		<Card.Root>
			<Card.Content class="p-4">
				<div class="flex items-center gap-3">
					<div class="rounded-lg bg-stone-100 p-2">
						<Users class="h-5 w-5 text-stone-600" />
					</div>
					<div>
						<div class="text-2xl font-bold">{counters().total}</div>
						<div class="text-xs text-muted-foreground">Total invités</div>
					</div>
				</div>
				<div class="mt-3 flex gap-2 text-xs">
					<span class="text-green-600 font-medium">{counters().present} présents</span>
					<span class="text-muted-foreground">·</span>
					<span class="text-red-500 font-medium">{counters().absent} absents</span>
					<span class="text-muted-foreground">·</span>
					<span class="text-muted-foreground">{counters().pending} en attente</span>
				</div>
			</Card.Content>
		</Card.Root>

		<!-- Types -->
		<Card.Root>
			<Card.Content class="p-4">
				<div class="flex items-center gap-3">
					<div class="rounded-lg bg-stone-100 p-2">
						<Wine class="h-5 w-5 text-stone-600" />
					</div>
					<div>
						<div class="text-2xl font-bold">{counters().complet} <span class="text-base font-normal text-muted-foreground">/</span> {counters().vinHonneur}</div>
						<div class="text-xs text-muted-foreground">Complets / VH</div>
					</div>
				</div>
			</Card.Content>
		</Card.Root>

		<!-- Ceremony & VH event -->
		<Card.Root>
			<Card.Content class="p-4">
				<div class="flex items-center gap-3">
					<div class="rounded-lg bg-stone-100 p-2">
						<Heart class="h-5 w-5 text-stone-600" />
					</div>
					<div>
						<div class="text-2xl font-bold">{counters().ceremonie}</div>
						<div class="text-xs text-muted-foreground">Cérémonie confirmés</div>
					</div>
				</div>
			</Card.Content>
		</Card.Root>

		<!-- Dinner & Brunch -->
		<Card.Root>
			<Card.Content class="p-4">
				<div class="flex items-center gap-3">
					<div class="rounded-lg bg-stone-100 p-2">
						<Utensils class="h-5 w-5 text-stone-600" />
					</div>
					<div>
						<div class="text-2xl font-bold">{counters().diner} <span class="text-base font-normal text-muted-foreground">/</span> {counters().brunch}</div>
						<div class="text-xs text-muted-foreground">Dîner / Brunch</div>
					</div>
				</div>
			</Card.Content>
		</Card.Root>
	</div>

	<!-- Guest List -->
	<Card.Root>
		<Card.Header>
			<div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<Card.Title>Liste des invités ({sortedGuests.length})</Card.Title>
				<div class="flex flex-col gap-2 sm:flex-row sm:items-center">
					<select
						bind:value={typeFilter}
						class="h-9 rounded-md border border-input bg-background px-3 text-sm"
					>
						<option value="all">Tous les types</option>
						<option value="complet">Complet</option>
						<option value="vin_honneur">Vin d'honneur</option>
					</select>
					<div class="relative w-full sm:w-64">
						<Input type="search" placeholder="Rechercher un invité..." bind:value={searchQuery} />
					</div>
					<Button onclick={() => (showAddDialog = true)} size="sm">
						<Plus class="mr-2 h-4 w-4" />
						Ajouter
					</Button>
				</div>
			</div>
		</Card.Header>
		<Card.Content>
			{#if hasSelection}
				<div class="mb-4 flex flex-wrap items-center gap-3 rounded-lg border bg-muted/50 p-3">
					<span class="text-sm font-medium">{selectedGuestIds.size} sélectionné(s)</span>
					<form
						method="POST"
						action="?/bulkUpdateType"
						use:enhance={() => {
							isBulkUpdating = true;
							return async ({ result, update }) => {
								isBulkUpdating = false;
								if (result.type === 'success') {
									toast.success(`Type mis à jour pour ${selectedGuestIds.size} invité(s)`);
									clearSelection();
								} else if (result.type === 'failure') {
									// eslint-disable-next-line @typescript-eslint/no-explicit-any
									toast.error((result.data as any)?.message || 'Erreur lors de la mise à jour.');
								}
								await update();
							};
						}}
						class="flex flex-wrap items-center gap-2"
					>
						{#each [...selectedGuestIds] as guestId (guestId)}
							<input type="hidden" name="guest_ids" value={guestId} />
						{/each}
						<select
							name="invitation_type"
							bind:value={bulkInvitationType}
							class="h-9 rounded-md border border-input bg-background px-3 text-sm"
						>
							<option value="complet">Complet</option>
							<option value="vin_honneur">Vin d'honneur</option>
						</select>
						<Button type="submit" size="sm" disabled={isBulkUpdating}>
							{#if isBulkUpdating}
								<Loader2 class="mr-2 h-4 w-4 animate-spin" />
							{/if}
							Appliquer
						</Button>
						<Button type="button" variant="ghost" size="sm" onclick={clearSelection}>
							Annuler
						</Button>
					</form>
				</div>
			{/if}

			<!-- Mobile list -->
			<div class="sm:hidden space-y-3">
				<div class="flex gap-2">
					<Button
						type="button"
						variant="outline"
						size="sm"
						class="w-full"
						onclick={() => toggleSort('full_name')}
					>
						Nom
						<ArrowUpDown class="ml-2 h-4 w-4" />
					</Button>
					<Button
						type="button"
						variant="outline"
						size="sm"
						class="w-full"
						onclick={() => toggleSort('rsvp_status')}
					>
						Statut
						<ArrowUpDown class="ml-2 h-4 w-4" />
					</Button>
				</div>

				{#each sortedGuests as guest (guest.id)}
					<div class="rounded-lg border bg-background p-3">
						<div class="flex items-start justify-between gap-3">
							<div class="flex items-start gap-2">
								<Checkbox
									checked={selectedGuestIds.has(guest.id)}
									onCheckedChange={() => toggleGuestSelection(guest.id)}
									class="mt-1"
								/>
								<div class="min-w-0">
									<div class="flex flex-wrap items-center gap-2">
										<div class="font-medium break-words">{guest.full_name || 'Sans nom'}</div>
										{#if guest.auth_id}
											<span title="Compte lié">
												<Link class="h-3 w-3 text-blue-500" />
											</span>
										{/if}
										{#if guest.invitation_type === 'vin_honneur'}
											<Badge variant="outline" class="text-[10px] h-5 px-1.5 border-orange-400 text-orange-600">VH</Badge>
										{:else}
											<Badge variant="outline" class="text-[10px] h-5 px-1.5 border-green-400 text-green-600">C</Badge>
										{/if}
										{#if guest.is_child}
											<Badge variant="outline" class="text-[10px] h-5 px-1.5">Enfant</Badge>
										{/if}
										{#if hasDetails(guest)}
											<span title="A des détails (régime/message)">
												<Info class="h-4 w-4 text-amber-500" />
											</span>
										{/if}
									</div>
									{#if guest.email}
										<div class="mt-1 text-xs text-muted-foreground break-words">{guest.email}</div>
									{/if}
								</div>
							</div>

							<div class="flex items-center gap-2">
								<ViewDetailsDialog {guest} />
								<EditGuestDialog {guest} {rooms} />
								<DeleteGuestDialog {guest} />
							</div>
						</div>

						<div class="mt-3 flex items-center justify-between gap-2">
							<div>
								{#if guest.rsvp_status === 'present'}
									<Badge variant="default" class="bg-green-600 hover:bg-green-700">Présent</Badge>
								{:else if guest.rsvp_status === 'absent'}
									<Badge variant="destructive">Absent</Badge>
								{:else}
									<Badge variant="secondary">En attente</Badge>
								{/if}
							</div>
							<div class="text-xs text-muted-foreground">
								{#if guest.managed_by}
									via {guest.managed_by.full_name}
								{:else}
									-
								{/if}
							</div>
						</div>
					</div>
				{/each}
			</div>

			<!-- Desktop table -->
			<div class="hidden sm:block w-full overflow-x-auto">
				<div class="min-w-0 sm:min-w-[820px]">
					<Table.Root>
						<Table.Header>
							<Table.Row>
								<Table.Head class="w-[40px]"></Table.Head>
								<Table.Head>
									<Button variant="ghost" onclick={() => toggleSort('full_name')} class="-ml-4">
										Nom / Email
										<ArrowUpDown class="ml-2 h-4 w-4" />
									</Button>
								</Table.Head>
								<Table.Head>Type</Table.Head>
								<Table.Head class="hidden md:table-cell">Validé par</Table.Head>
								<Table.Head>
									<Button variant="ghost" onclick={() => toggleSort('rsvp_status')} class="-ml-4">
										Statut
										<ArrowUpDown class="ml-2 h-4 w-4" />
									</Button>
								</Table.Head>
								<Table.Head class="w-[100px]"></Table.Head>
							</Table.Row>
						</Table.Header>
						<Table.Body>
							{#each sortedGuests as guest (guest.id)}
								<Table.Row>
									<Table.Cell>
										<Checkbox
											checked={selectedGuestIds.has(guest.id)}
											onCheckedChange={() => toggleGuestSelection(guest.id)}
										/>
									</Table.Cell>
									<Table.Cell>
										<div class="flex items-center gap-2">
											<div class="font-medium break-words">{guest.full_name || 'Sans nom'}</div>
											{#if guest.auth_id}
												<span title="Compte lié">
													<Link class="h-3 w-3 text-blue-500" />
												</span>
											{/if}
											{#if guest.is_child}
												<Badge variant="outline" class="text-[10px] h-5 px-1.5">Enfant</Badge>
											{/if}
											{#if hasDetails(guest)}
												<span title="A des détails (régime/message)">
													<Info class="h-4 w-4 text-amber-500" />
												</span>
											{/if}
										</div>
										{#if guest.email}
											<div class="text-xs text-muted-foreground break-words">{guest.email}</div>
										{/if}
									</Table.Cell>
									<Table.Cell>
										{#if guest.invitation_type === 'vin_honneur'}
											<Badge variant="outline" class="border-orange-400 text-orange-600">VH</Badge>
										{:else}
											<Badge variant="outline" class="border-green-400 text-green-600">C</Badge>
										{/if}
									</Table.Cell>
									<Table.Cell class="hidden md:table-cell">
										{#if guest.managed_by}
											<span class="text-xs text-muted-foreground">
												via {guest.managed_by.full_name}
											</span>
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
										<div class="flex items-center gap-1">
											<ViewDetailsDialog {guest} />
											<EditGuestDialog {guest} {rooms} />
											<DeleteGuestDialog {guest} />
										</div>
									</Table.Cell>
								</Table.Row>
							{/each}
						</Table.Body>
					</Table.Root>
				</div>
			</div>
		</Card.Content>
	</Card.Root>
</div>

<!-- Add Guest Dialog -->
<Dialog.Root bind:open={showAddDialog}>
	<Dialog.Content class="sm:max-w-[425px]">
		<Dialog.Header>
			<Dialog.Title>Ajouter un invité</Dialog.Title>
			<Dialog.Description>Ajoutez un nouvel invité à la liste.</Dialog.Description>
		</Dialog.Header>

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
						showAddDialog = false;
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

			<div class="space-y-2">
				<Label for="invitation_type">Type d'invitation</Label>
				<select
					id="invitation_type"
					name="invitation_type"
					class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
				>
					<option value="complet" selected>Complet</option>
					<option value="vin_honneur">Vin d'honneur</option>
				</select>
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

			<Dialog.Footer>
				<Button type="button" variant="outline" onclick={() => (showAddDialog = false)}>
					Annuler
				</Button>
				<Button type="submit" disabled={isAdding}>
					{#if isAdding}
						<Loader2 class="mr-2 h-4 w-4 animate-spin" />
					{:else}
						<Plus class="mr-2 h-4 w-4" />
					{/if}
					Ajouter
				</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>
