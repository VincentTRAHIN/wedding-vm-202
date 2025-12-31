<script lang="ts">
	import UploadButton from './upload-button.svelte';
	import PhotoGrid from './photo-grid.svelte';
	import Lightbox from './lightbox.svelte';
	import { Heart, Image as ImageIcon } from 'lucide-svelte';
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
	<div class="mb-8 space-y-2">
		<h1 class="font-serif text-3xl font-bold text-primary md:text-4xl">Galerie Photo</h1>
		<p class="text-muted-foreground">Partagez vos photos et découvrez celles des autres invités.</p>
	</div>

	<div class="mb-6 flex gap-2">
		<button
			class="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors {filter ===
			'all'
				? 'bg-sage-600 text-white'
				: 'bg-stone-100 text-stone-600 hover:bg-stone-200'}"
			onclick={() => (filter = 'all')}
		>
			<ImageIcon class="h-4 w-4" />
			Toutes les photos
		</button>
		<button
			class="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors {filter ===
			'likes'
				? 'bg-sage-600 text-white'
				: 'bg-stone-100 text-stone-600 hover:bg-stone-200'}"
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
