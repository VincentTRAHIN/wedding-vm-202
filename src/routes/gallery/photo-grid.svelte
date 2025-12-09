<script lang="ts">
	import { enhance } from '$app/forms';
	import * as Card from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import { Clock, Trash2 } from 'lucide-svelte';
	import { toast } from 'svelte-sonner';

	let { photos, supabase, currentUserId, userRole, onPhotoClick } = $props();

	function getPublicUrl(path: string) {
		const { data } = supabase.storage.from('photos').getPublicUrl(path);
		return data.publicUrl;
	}
</script>

<div class="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
	{#each photos as photo, index (photo.id)}
		<Card.Root class="overflow-hidden group">
			<div class="relative aspect-square">
				<button
					type="button"
					class="h-full w-full cursor-zoom-in border-0 p-0 bg-transparent block"
					onclick={() => onPhotoClick(index)}
					aria-label="Voir la photo en grand"
				>
					<img
						src={getPublicUrl(photo.storage_path)}
						alt={photo.caption || 'Photo invité'}
						class="h-full w-full object-cover transition-transform hover:scale-105"
						loading="lazy"
					/>
				</button>
				{#if photo.status === 'pending'}
					<div class="absolute left-2 top-2 pointer-events-none">
						<Badge
							variant="secondary"
							class="flex items-center gap-1 bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
						>
							<Clock class="h-3 w-3" />
							En attente
						</Badge>
					</div>
				{/if}

				{#if currentUserId && (photo.owner_id === currentUserId || userRole === 'admin')}
					<div
						class="absolute right-2 top-2 opacity-0 transition-opacity group-hover:opacity-100 z-10"
					>
						<form
							action="?/delete"
							method="POST"
							use:enhance={() => {
								return async ({ result, update }) => {
									if (result.type === 'success') {
										toast.success('Photo supprimée');
									} else if (result.type === 'failure') {
										toast.error('Erreur lors de la suppression');
									}
									await update();
								};
							}}
						>
							<input type="hidden" name="photoId" value={photo.id} />
							<Button
								variant="destructive"
								size="icon"
								class="h-8 w-8 rounded-full shadow-sm"
								type="submit"
							>
								<Trash2 class="h-4 w-4" />
								<span class="sr-only">Supprimer</span>
							</Button>
						</form>
					</div>
				{/if}
			</div>
			{#if photo.caption || photo.guests?.full_name}
				<div class="p-2 text-sm">
					{#if photo.caption}
						<p class="font-medium truncate">{photo.caption}</p>
					{/if}
					{#if photo.guests?.full_name}
						<p class="text-xs text-muted-foreground truncate">Par {photo.guests.full_name}</p>
					{/if}
				</div>
			{/if}
		</Card.Root>
	{/each}
</div>

{#if photos.length === 0}
	<div class="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
		<p class="text-lg">Aucune photo pour le moment.</p>
		<p class="text-sm">Soyez le premier à partager un souvenir !</p>
	</div>
{/if}
