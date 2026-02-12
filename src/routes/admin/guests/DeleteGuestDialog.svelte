<script lang="ts">
	import { enhance } from '$app/forms';
	import { Button, buttonVariants } from '$lib/components/ui/button';
	import * as Dialog from '$lib/components/ui/dialog';
	import { toast } from 'svelte-sonner';
	import { Loader2, Trash2 } from 'lucide-svelte';

	let { guest } = $props<{
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		guest: any;
	}>();

	let isOpen = $state(false);
	let isSubmitting = $state(false);
</script>

<Dialog.Root bind:open={isOpen}>
	<Dialog.Trigger
		class={buttonVariants({
			variant: 'ghost',
			size: 'icon',
			className: 'h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50'
		})}
	>
		<Trash2 class="h-4 w-4" />
		<span class="sr-only">Supprimer</span>
	</Dialog.Trigger>
	<Dialog.Content class="sm:max-w-[450px]">
		<Dialog.Header>
			<Dialog.Title>Supprimer l'invité</Dialog.Title>
			<Dialog.Description>
				Êtes-vous sûr de vouloir supprimer <strong>{guest.full_name}</strong> ?
				<br />
				Cette action est irréversible.
			</Dialog.Description>
		</Dialog.Header>

		<form
			method="POST"
			action="?/delete"
			use:enhance={() => {
				isSubmitting = true;
				return async ({ result, update }) => {
					isSubmitting = false;
					if (result.type === 'success') {
						toast.success('Invité supprimé avec succès !');
						isOpen = false;
					} else if (result.type === 'failure') {
						// eslint-disable-next-line @typescript-eslint/no-explicit-any
						toast.error((result.data as any)?.message || 'Erreur lors de la suppression.');
					}
					await update();
				};
			}}
		>
			<input type="hidden" name="id" value={guest.id} />

			<div class="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-4 pt-4">
				<Button type="button" variant="outline" onclick={() => (isOpen = false)} class="w-full sm:w-auto">Annuler</Button>
				<Button type="submit" variant="destructive" disabled={isSubmitting} class="w-full sm:w-auto">
					{#if isSubmitting}
						<Loader2 class="mr-2 h-4 w-4 animate-spin" />
					{/if}
					Supprimer
				</Button>
			</div>
		</form>
	</Dialog.Content>
</Dialog.Root>
