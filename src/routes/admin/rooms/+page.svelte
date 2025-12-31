<script lang="ts">
	import { enhance } from '$app/forms';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import * as Table from '$lib/components/ui/table';
	import * as Card from '$lib/components/ui/card';
	import { toast } from 'svelte-sonner';
	import { Plus, Loader2, Pencil, Trash2, Users, UserPlus, UserMinus } from 'lucide-svelte';
	import * as Dialog from '$lib/components/ui/dialog';
	import type { Database } from '$lib/types/supabase';

	type Room = Database['public']['Tables']['rooms']['Row'];
	type GuestLite = { id: string; full_name: string | null; room_id: string | null };

	let { data } = $props();
	let { rooms, guests } = $derived(data as { rooms: Room[]; guests: GuestLite[] });

	let isAdding = $state(false);
	let editingRoom = $state<Room | null>(null);
	let deletingRoom = $state<Room | null>(null);
	let isEditing = $state(false);
	let isDeleting = $state(false);

	let assigningRoom = $state<Room | null>(null);
	let selectedGuestId = $state<string>('');

	let assignedGuests = $derived.by(() => {
		const room = assigningRoom;
		if (!room) return [];
		return guests.filter((g) => g.room_id === room.id);
	});
	let unassignedGuests = $derived(guests.filter((g) => !g.room_id));
	let guestCountByRoomId = $derived.by(() => {
		const map = new Map<string, number>();
		for (const g of guests) {
			if (!g.room_id) continue;
			map.set(g.room_id, (map.get(g.room_id) ?? 0) + 1);
		}
		return map;
	});
</script>

<div class="grid gap-8 lg:grid-cols-3">
	<!-- Add Room Form -->
	<Card.Root class="h-fit lg:col-span-1">
		<Card.Header>
			<Card.Title>Ajouter une chambre</Card.Title>
			<Card.Description>Ajoutez une chambre ou un dortoir.</Card.Description>
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
							toast.success('Chambre ajoutée !');
						} else {
							toast.error("Erreur lors de l'ajout.");
						}
						await update();
					};
				}}
				class="space-y-4"
			>
				<div class="space-y-2">
					<Label for="name">Nom <span class="text-red-500">*</span></Label>
					<Input type="text" id="name" name="name" placeholder="Demacia - Suite Royale" required />
				</div>

				<div class="space-y-2">
					<Label for="capacity">Capacité</Label>
					<Input type="number" id="capacity" name="capacity" value="2" min="1" required />
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

	<!-- Rooms List -->
	<Card.Root class="lg:col-span-2">
		<Card.Header>
			<Card.Title>Liste des Chambres ({rooms.length})</Card.Title>
		</Card.Header>
		<Card.Content>
			<Table.Root>
				<Table.Header>
					<Table.Row>
						<Table.Head>Nom</Table.Head>
						<Table.Head>Capacité</Table.Head>
						<Table.Head>Assignés</Table.Head>
						<Table.Head class="text-right">Actions</Table.Head>
					</Table.Row>
				</Table.Header>
				<Table.Body>
					{#each rooms as room (room.id)}
						<Table.Row>
							<Table.Cell class="font-medium">{room.name}</Table.Cell>
							<Table.Cell>{room.capacity}</Table.Cell>
							<Table.Cell>
								{guestCountByRoomId.get(room.id) ?? 0}
							</Table.Cell>
							<Table.Cell class="text-right">
								<div class="flex justify-end gap-2">
									<Button
										variant="ghost"
										size="icon"
										onclick={() => {
											assigningRoom = room;
											selectedGuestId = '';
										}}
										aria-label="Assigner des invités"
									>
										<Users class="h-4 w-4" />
									</Button>
									<Button variant="ghost" size="icon" onclick={() => (editingRoom = room)}>
										<Pencil class="h-4 w-4" />
									</Button>
									<Button
										variant="ghost"
										size="icon"
										class="text-red-500 hover:text-red-600"
										onclick={() => (deletingRoom = room)}
									>
										<Trash2 class="h-4 w-4" />
									</Button>
								</div>
							</Table.Cell>
						</Table.Row>
					{/each}
				</Table.Body>
			</Table.Root>
		</Card.Content>
	</Card.Root>
</div>

<!-- Assign Guests Dialog -->
<Dialog.Root open={!!assigningRoom} onOpenChange={(open) => !open && (assigningRoom = null)}>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Assigner des invités</Dialog.Title>
			{#if assigningRoom}
				<Dialog.Description>
					Chambre : <span class="font-medium">{assigningRoom.name}</span>
				</Dialog.Description>
			{/if}
		</Dialog.Header>

		{#if assigningRoom}
			<div class="space-y-4">
				<div class="space-y-2">
					<div class="text-sm font-medium">Invités assignés ({assignedGuests.length})</div>
					{#if assignedGuests.length === 0}
						<p class="text-sm text-muted-foreground">Aucun invité assigné à cette chambre.</p>
					{:else}
						<div class="space-y-2">
							{#each assignedGuests as g (g.id)}
								<div class="flex items-center justify-between rounded-md border p-2">
									<div class="text-sm font-medium">{g.full_name ?? 'Invité'}</div>
									<form
										method="POST"
										action="?/unassignGuest"
										use:enhance={() => {
											return async ({ result, update }) => {
												if (result.type === 'success') toast.success('Invité retiré.');
												else toast.error('Erreur lors du retrait.');
												await update();
											};
										}}
									>
										<input type="hidden" name="guest_id" value={g.id} />
										<Button type="submit" variant="outline" size="sm">
											<UserMinus class="mr-2 h-4 w-4" />
											Retirer
										</Button>
									</form>
								</div>
							{/each}
						</div>
					{/if}
				</div>

				<div class="space-y-2">
					<div class="text-sm font-medium">Assigner un nouvel invité</div>
					<form
						method="POST"
						action="?/assignGuest"
						use:enhance={() => {
							return async ({ result, update }) => {
								if (result.type === 'success') toast.success('Invité assigné.');
								else toast.error("Erreur lors de l'assignation.");
								await update();
							};
						}}
						class="space-y-3"
					>
						<input type="hidden" name="room_id" value={assigningRoom.id} />
						<select
							name="guest_id"
							required
							bind:value={selectedGuestId}
							class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
						>
							<option value="" disabled>Choisir un invité…</option>
							{#each unassignedGuests as g (g.id)}
								<option value={g.id}>{g.full_name ?? 'Invité'}</option>
							{/each}
						</select>
						<Button type="submit" class="w-full" disabled={!selectedGuestId}>
							<UserPlus class="mr-2 h-4 w-4" />
							Assigner
						</Button>
					</form>
					<p class="text-xs text-muted-foreground">
						Seuls les invités non assignés sont proposés ici.
					</p>
				</div>
			</div>
		{/if}
	</Dialog.Content>
</Dialog.Root>

<!-- Edit Dialog -->
<Dialog.Root open={!!editingRoom} onOpenChange={(open) => !open && (editingRoom = null)}>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Modifier la chambre</Dialog.Title>
		</Dialog.Header>
		{#if editingRoom}
			<form
				method="POST"
				action="?/update"
				use:enhance={() => {
					isEditing = true;
					return async ({ result, update }) => {
						isEditing = false;
						if (result.type === 'success') {
							toast.success('Chambre modifiée !');
							editingRoom = null;
						} else {
							toast.error('Erreur lors de la modification.');
						}
						await update();
					};
				}}
				class="space-y-4"
			>
				<input type="hidden" name="id" value={editingRoom.id} />
				<div class="space-y-2">
					<Label for="edit_name">Nom</Label>
					<Input type="text" id="edit_name" name="name" value={editingRoom.name} required />
				</div>
				<div class="space-y-2">
					<Label for="edit_capacity">Capacité</Label>
					<Input
						type="number"
						id="edit_capacity"
						name="capacity"
						value={editingRoom.capacity}
						required
					/>
				</div>
				<Dialog.Footer>
					<Button type="button" variant="outline" onclick={() => (editingRoom = null)}
						>Annuler</Button
					>
					<Button type="submit" disabled={isEditing}>Enregistrer</Button>
				</Dialog.Footer>
			</form>
		{/if}
	</Dialog.Content>
</Dialog.Root>

<!-- Delete Dialog -->
<Dialog.Root open={!!deletingRoom} onOpenChange={(open) => !open && (deletingRoom = null)}>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Supprimer la chambre ?</Dialog.Title>
			<Dialog.Description>
				Cette action est irréversible. Assurez-vous qu'aucun invité n'est assigné à cette chambre.
			</Dialog.Description>
		</Dialog.Header>
		{#if deletingRoom}
			<form
				method="POST"
				action="?/delete"
				use:enhance={() => {
					isDeleting = true;
					return async ({ result, update }) => {
						isDeleting = false;
						if (result.type === 'success') {
							toast.success('Chambre supprimée !');
							deletingRoom = null;
						} else {
							toast.error('Erreur lors de la suppression.');
						}
						await update();
					};
				}}
			>
				<input type="hidden" name="id" value={deletingRoom.id} />
				<Dialog.Footer>
					<Button type="button" variant="outline" onclick={() => (deletingRoom = null)}
						>Annuler</Button
					>
					<Button type="submit" variant="destructive" disabled={isDeleting}>Supprimer</Button>
				</Dialog.Footer>
			</form>
		{/if}
	</Dialog.Content>
</Dialog.Root>
