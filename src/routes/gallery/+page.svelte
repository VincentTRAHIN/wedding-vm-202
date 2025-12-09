<script lang="ts">
	import UploadButton from './upload-button.svelte';
	import PhotoGrid from './photo-grid.svelte';
	import Lightbox from './lightbox.svelte';

	let { data } = $props();
	let { photos, supabase, session, userRole } = $derived(data);

	let selectedPhotoIndex = $state(-1);

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

	<PhotoGrid
		{photos}
		{supabase}
		currentUserId={session?.user?.id}
		{userRole}
		onPhotoClick={handlePhotoClick}
	/>

	<UploadButton />

	{#if selectedPhotoIndex >= 0}
		<Lightbox {photos} initialIndex={selectedPhotoIndex} {supabase} onClose={handleClose} />
	{/if}
</div>
