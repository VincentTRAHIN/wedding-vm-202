<script lang="ts">
	import { enhance } from '$app/forms';
	import { Button, buttonVariants } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Checkbox } from '$lib/components/ui/checkbox';
	import * as Dialog from '$lib/components/ui/dialog';
	import { toast } from 'svelte-sonner';
	import { Loader2, Pencil } from 'lucide-svelte';

	let { guest, allGuests } = $props<{
		guest: any;
		allGuests: any[];
	}>();

	let isOpen = $state(false);
	let isSubmitting = $state(false);
	let isChild = $state(guest.is_child || false);
</script>

<Dialog.Root bind:open={isOpen}>
	<Dialog.Trigger class={buttonVariants({ variant: 'ghost', size: 'icon', className: 'h-8 w-8' })}>
		<Pencil class="h-4 w-4" />
		<span class="sr-only">Modifier</span>
	</Dialog.Trigger>
	<Dialog.Content class="sm:max-w-[425px]">
		<Dialog.Header>
			<Dialog.Title>Modifier l'invité</Dialog.Title>
			<Dialog.Description>
				Modifiez les informations de {guest.full_name}.
			</Dialog.Description>
		</Dialog.Header>

		<form
			method="POST"
			action="?/edit"
			use:enhance={() => {
				isSubmitting = true;
				return async ({ result, update }) => {
					isSubmitting = false;
					if (result.type === 'success') {
						toast.success('Invité modifié avec succès !');
						isOpen = false;
					} else if (result.type === 'failure') {
						// eslint-disable-next-line @typescript-eslint/no-explicit-any
						toast.error((result.data as any)?.message || 'Erreur lors de la modification.');
					}
					await update();
				};
			}}
			class="space-y-4"
		>
			<input type="hidden" name="id" value={guest.id} />

			<div class="space-y-2">
				<Label for="full_name">Nom complet</Label>
				<Input
					type="text"
					id="full_name"
					name="full_name"
					value={guest.full_name}
					placeholder="Jean Dupont"
					required
				/>
			</div>

			<div class="space-y-2">
				<Label for="email">Email</Label>
				<Input
					type="email"
					id="email"
					name="email"
					value={guest.email || ''}
					placeholder="email@exemple.com"
				/>
			</div>

			<div class="flex items-center space-x-2">
				<Checkbox id="edit_is_child_{guest.id}" bind:checked={isChild} name="is_child" />
				<Label
					for="edit_is_child_{guest.id}"
					class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
				>
					Cet invité est un enfant (-18 ans)
				</Label>
			</div>

			<Dialog.Footer>
				<Button type="submit" disabled={isSubmitting}>
					{#if isSubmitting}
						<Loader2 class="mr-2 h-4 w-4 animate-spin" />
					{/if}
					Enregistrer
				</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>
