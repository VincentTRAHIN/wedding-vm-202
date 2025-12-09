<script lang="ts">
	import { enhance } from '$app/forms';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import { Check, X } from 'lucide-svelte';
	import { toast } from 'svelte-sonner';

	let { data } = $props();
	let { photos, supabase } = $derived(data);

	function getPublicUrl(path: string) {
		const { data } = supabase.storage.from('photos').getPublicUrl(path);
		return data.publicUrl;
	}
</script>

<div class="space-y-6">
	<div class="flex items-center justify-between">
		<h2 class="text-2xl font-bold tracking-tight">Modération Photos</h2>
		<span class="text-muted-foreground">{photos.length} en attente</span>
	</div>

	{#if photos.length === 0}
		<Card.Root class="flex h-64 items-center justify-center text-muted-foreground">
			<p>Aucune photo en attente de modération.</p>
		</Card.Root>
	{:else}
		<div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
			{#each photos as photo (photo.id)}
				<Card.Root>
					<div class="relative aspect-square overflow-hidden rounded-t-lg">
						<img
							src={getPublicUrl(photo.storage_path)}
							alt={photo.caption || 'Photo à modérer'}
							class="h-full w-full object-cover"
						/>
					</div>
					<Card.Content class="p-4">
						<div class="mb-4 text-sm">
							<p class="font-medium">{photo.guests?.full_name || 'Invité inconnu'}</p>
							{#if photo.caption}
								<p class="text-muted-foreground italic">"{photo.caption}"</p>
							{/if}
						</div>
						<div class="flex gap-2">
							<form
								method="POST"
								action="?/moderate"
								class="flex-1"
								use:enhance={() => {
									return async ({ result, update }) => {
										if (result.type === 'success') {
											toast.success('Photo approuvée');
										}
										await update();
									};
								}}
							>
								<input type="hidden" name="photo_id" value={photo.id} />
								<input type="hidden" name="action" value="approve" />
								<Button type="submit" class="w-full bg-green-600 hover:bg-green-700">
									<Check class="mr-2 h-4 w-4" />
									Approuver
								</Button>
							</form>

							<form
								method="POST"
								action="?/moderate"
								class="flex-1"
								use:enhance={() => {
									return async ({ result, update }) => {
										if (result.type === 'success') {
											toast.success('Photo rejetée');
										}
										await update();
									};
								}}
							>
								<input type="hidden" name="photo_id" value={photo.id} />
								<input type="hidden" name="action" value="reject" />
								<Button type="submit" variant="destructive" class="w-full">
									<X class="mr-2 h-4 w-4" />
									Rejeter
								</Button>
							</form>
						</div>
					</Card.Content>
				</Card.Root>
			{/each}
		</div>
	{/if}
</div>
