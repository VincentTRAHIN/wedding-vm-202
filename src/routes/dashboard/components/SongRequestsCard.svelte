<script lang="ts">
	import { enhance } from '$app/forms';
	import * as Card from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { toast } from 'svelte-sonner';
	import { Loader2, Music2, Trash2 } from 'lucide-svelte';
	import type { Database } from '$lib/types/supabase';

	type SongRequest = Database['public']['Tables']['song_requests']['Row'];

	let { songRequests } = $props<{ songRequests: SongRequest[] }>();
	let isSubmitting = $state(false);
	let deletingId = $state<string | null>(null);
</script>

<Card.Root>
	<Card.Header>
		<Card.Title>Ambiance & Participation</Card.Title>
		<Card.Description>Proposez une musique au DJ.</Card.Description>
	</Card.Header>
	<Card.Content class="space-y-6">
		<form
			method="POST"
			action="?/createSongRequest"
			class="space-y-4"
			use:enhance={() => {
				isSubmitting = true;
				return async ({ result, update }) => {
					isSubmitting = false;
					if (result.type === 'success') {
						toast.success('Merci ! Votre proposition a été envoyée.');
					}
					if (result.type === 'failure') {
						toast.error("Impossible d'enregistrer la proposition.");
					}
					await update();
				};
			}}
		>
			<div class="space-y-2">
				<Label for="track_name">Titre</Label>
				<Input id="track_name" name="track_name" placeholder="Ex: Time" required />
			</div>
			<div class="space-y-2">
				<Label for="artist">Artiste (optionnel)</Label>
				<Input id="artist" name="artist" placeholder="Ex: Hans Zimmer" />
			</div>
			<Button type="submit" class="w-full gap-2" disabled={isSubmitting}>
				{#if isSubmitting}
					<Loader2 class="h-4 w-4 animate-spin" />
				{/if}
				<Music2 class="h-4 w-4" />
				Proposer
			</Button>
		</form>

		<div class="space-y-3">
			<h3 class="text-sm font-medium text-muted-foreground">Vos propositions</h3>
			{#if songRequests.length === 0}
				<p class="text-sm text-muted-foreground">Aucune proposition pour le moment.</p>
			{:else}
				<ul class="space-y-2">
					{#each songRequests as req (req.id)}
						<li
							class="flex items-center justify-between gap-3 rounded-md bg-stone-50 px-3 py-2 text-sm"
						>
							<div>
								<span class="font-medium">{req.track_name}</span>
								{#if req.artist}
									<span class="text-muted-foreground"> — {req.artist}</span>
								{/if}
							</div>

							<form
								method="POST"
								action="?/deleteSongRequest"
								use:enhance={() => {
									deletingId = req.id;
									return async ({ result, update }) => {
										deletingId = null;
										if (result.type === 'success') {
											toast.success('Proposition supprimée.');
										} else {
											toast.error('Impossible de supprimer la proposition.');
										}
										await update();
									};
								}}
							>
								<input type="hidden" name="id" value={req.id} />
								<Button
									type="submit"
									variant="ghost"
									size="sm"
									disabled={deletingId === req.id}
									class="gap-2"
								>
									<Trash2 class="h-4 w-4" />
									Supprimer
								</Button>
							</form>
						</li>
					{/each}
				</ul>
			{/if}
		</div>
	</Card.Content>
</Card.Root>
