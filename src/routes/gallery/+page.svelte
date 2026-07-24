<script lang="ts">
	import UploadButton from './upload-button.svelte';
	import PhotoGrid from './photo-grid.svelte';
	import Lightbox from './lightbox.svelte';
	import { Heart, Image as ImageIcon, Download, Loader2 } from 'lucide-svelte';
	import type { Database } from '$lib/types/supabase';

	type Photo = Database['public']['Tables']['photos']['Row'] & {
		is_liked_by_user: boolean;
		likes_count: number;
		comments_count: number;
		guests: { full_name: string | null } | null;
	};

	let { data } = $props();
	let { photos, supabase, session, userRole } = $derived(data);

	let filter = $state<'all' | 'likes'>('all');
	let selectedPhotoIndex = $state(-1);
	let downloading = $state(false);

	function handleDownloadAll() {
		if (downloading) return;
		downloading = true;
		// Déclenche le téléchargement du ZIP sans quitter la page (Content-Disposition: attachment).
		window.location.href = '/admin/download-photos';
		// Le navigateur affiche ensuite sa propre progression ; on réinitialise le spinner.
		setTimeout(() => (downloading = false), 4000);
	}

	let filteredPhotos = $derived(
		filter === 'likes' ? photos.filter((p: Photo) => p.is_liked_by_user) : photos
	);

	function handlePhotoClick(index: number) {
		selectedPhotoIndex = index;
	}

	function handleClose() {
		selectedPhotoIndex = -1;
	}
</script>

<div class="container min-h-[calc(100vh-3.5rem)] py-8 pb-24">
	<div class="mb-8 flex items-start justify-between gap-4">
		<div class="space-y-2">
			<h1 class="font-serif text-3xl font-bold text-primary md:text-4xl">Galerie Photo</h1>
			<p class="text-muted-foreground">
				Partagez vos photos et découvrez celles des autres invités.
			</p>
		</div>

		{#if userRole === 'admin'}
			<button
				type="button"
				onclick={handleDownloadAll}
				disabled={downloading}
				class="flex shrink-0 items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-70"
				title="Télécharger toutes les photos (ZIP)"
			>
				{#if downloading}
					<Loader2 class="h-4 w-4 animate-spin" />
					<span class="hidden sm:inline">Préparation…</span>
				{:else}
					<Download class="h-4 w-4" />
					<span class="hidden sm:inline">Tout télécharger</span>
				{/if}
			</button>
		{/if}
	</div>

	<div class="mb-6 flex gap-2">
		<button
			class="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors {filter ===
			'all'
				? 'bg-primary text-primary-foreground'
				: 'bg-muted text-muted-foreground hover:bg-muted/80'}"
			onclick={() => (filter = 'all')}
		>
			<ImageIcon class="h-4 w-4" />
			Toutes les photos
		</button>
		<button
			class="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors {filter ===
			'likes'
				? 'bg-primary text-primary-foreground'
				: 'bg-muted text-muted-foreground hover:bg-muted/80'}"
			onclick={() => (filter = 'likes')}
		>
			<Heart class="h-4 w-4 {filter === 'likes' ? 'fill-current' : ''}" />
			Mes Favoris
		</button>
	</div>

	<PhotoGrid
		photos={filteredPhotos}
		{supabase}
		currentUserId={session?.user?.id}
		{userRole}
		onPhotoClick={handlePhotoClick}
	/>

	<UploadButton />

	{#if selectedPhotoIndex >= 0}
		<Lightbox
			photos={filteredPhotos}
			initialIndex={selectedPhotoIndex}
			{supabase}
			user={session?.user}
			onClose={handleClose}
		/>
	{/if}
</div>
