<script lang="ts">
	import { enhance } from '$app/forms';
	import * as Card from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import { Clock, Trash2, Heart, MessageCircle } from 'lucide-svelte';
	import { toast } from 'svelte-sonner';

	let { photos: initialPhotos = [], supabase, currentUserId, userRole, onPhotoClick } = $props();

	let photos = $state(initialPhotos);

	$effect(() => {
		photos = initialPhotos;
	});

	function getPublicUrl(path: string) {
		const { data } = supabase.storage.from('photos').getPublicUrl(path);
		return data.publicUrl;
	}
</script>

<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
	{#each photos as photo, index (photo.id)}
		<Card.Root class="overflow-hidden group flex flex-col h-full">
			<div class="relative w-full pt-[100%]">
				<button
					type="button"
					class="absolute inset-0 h-full w-full cursor-zoom-in border-0 p-0 bg-transparent block"
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

			<!-- Social Actions Bar -->
			<div class="p-3">
				<div class="flex items-center gap-4 mb-2">
					<!-- Like Button -->
					<form
						action="?/toggleLike"
						method="POST"
						use:enhance={() => {
							// Optimistic UI
							const wasLiked = photo.is_liked_by_user;
							photo.is_liked_by_user = !wasLiked;
							photo.likes_count += wasLiked ? -1 : 1;

							return async ({ result, update }) => {
								if (result.type === 'failure') {
									// Revert on failure
									photo.is_liked_by_user = wasLiked;
									photo.likes_count += wasLiked ? 1 : -1;
									toast.error('Erreur lors du like');
								}
								await update({ reset: false });
							};
						}}
					>
						<input type="hidden" name="photoId" value={photo.id} />
						<button
							type="submit"
							class="flex items-center gap-1 transition-transform active:scale-95"
							aria-label={photo.is_liked_by_user ? "Je n'aime plus" : "J'aime"}
						>
							<Heart
								class="h-6 w-6 transition-colors {photo.is_liked_by_user
									? 'fill-red-500 text-red-500'
									: 'text-stone-600 hover:text-stone-900'}"
							/>
						</button>
					</form>

					<!-- Comment Button -->
					<button
						type="button"
						class="flex items-center gap-1 text-stone-600 transition-colors hover:text-sage-600"
						onclick={() => onPhotoClick(index)}
						aria-label="Commenter"
					>
						<MessageCircle class="h-6 w-6" />
					</button>
				</div>

				<!-- Likes Count -->
				<div class="mb-1 text-sm font-semibold text-stone-900">
					{photo.likes_count} J'aime
				</div>

				<!-- Caption -->
				{#if photo.caption}
					<div class="mb-1 text-sm line-clamp-2">
						<span class="font-bold mr-1">{photo.guests?.full_name || 'Invité'}</span>
						<span class="text-stone-700">{photo.caption}</span>
					</div>
				{/if}

				<!-- View Comments Link -->
				{#if photo.comments_count > 0}
					<button
						class="mb-2 text-sm text-stone-500 hover:text-stone-700"
						onclick={() => onPhotoClick(index)}
					>
						Voir les {photo.comments_count} commentaires
					</button>
				{/if}

				<!-- Fake Input -->
				<button
					class="w-full text-left text-sm text-stone-400 hover:text-stone-600"
					onclick={() => onPhotoClick(index)}
				>
					Ajouter un commentaire...
				</button>
			</div>
		</Card.Root>
	{/each}
</div>

{#if photos.length === 0}
	<div class="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
		<p class="text-lg">Aucune photo pour le moment.</p>
		<p class="text-sm">Soyez le premier à partager un souvenir !</p>
	</div>
{/if}
