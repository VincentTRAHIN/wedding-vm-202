<script lang="ts">
	import { X, ChevronLeft, ChevronRight } from 'lucide-svelte';
	import { fade } from 'svelte/transition';

	let { photos, initialIndex, supabase, onClose } = $props();

	let currentIndex = $state(initialIndex);
	let photo = $derived(photos[currentIndex]);
	let hasNext = $derived(currentIndex < photos.length - 1);
	let hasPrev = $derived(currentIndex > 0);

	function next() {
		if (hasNext) currentIndex++;
	}

	function prev() {
		if (hasPrev) currentIndex--;
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') onClose();
		if (e.key === 'ArrowRight' && hasNext) next();
		if (e.key === 'ArrowLeft' && hasPrev) prev();
	}

	function getPublicUrl(path: string) {
		const { data } = supabase.storage.from('photos').getPublicUrl(path);
		return data.publicUrl;
	}
</script>

<svelte:window onkeydown={handleKeydown} />

<div
	class="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm"
	transition:fade={{ duration: 200 }}
	role="dialog"
	aria-modal="true"
>
	<!-- Close Button -->
	<button
		class="absolute right-4 top-4 z-50 rounded-full bg-black/50 p-2 text-white hover:bg-white/20"
		onclick={onClose}
	>
		<X class="h-6 w-6" />
		<span class="sr-only">Fermer</span>
	</button>

	<!-- Navigation Left -->
	{#if hasPrev}
		<button
			class="absolute left-4 top-1/2 z-50 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white hover:bg-white/20"
			onclick={prev}
		>
			<ChevronLeft class="h-8 w-8" />
			<span class="sr-only">Précédent</span>
		</button>
	{/if}

	<!-- Image -->
	<div class="relative h-full w-full p-4 md:p-10 flex items-center justify-center">
		{#key photo.id}
			<img
				src={getPublicUrl(photo.storage_path)}
				alt={photo.caption || 'Photo'}
				class="max-h-full max-w-full object-contain"
				in:fade={{ duration: 200 }}
			/>
		{/key}
		{#if photo.caption || photo.guests?.full_name}
			<div class="absolute bottom-8 left-0 right-0 text-center pointer-events-none">
				<div
					class="inline-block rounded-md bg-black/60 px-4 py-2 text-white backdrop-blur-md pointer-events-auto"
				>
					{#if photo.caption}
						<p class="font-medium">{photo.caption}</p>
					{/if}
					{#if photo.guests?.full_name}
						<p class="text-xs text-gray-300">Par {photo.guests.full_name}</p>
					{/if}
				</div>
			</div>
		{/if}
	</div>

	<!-- Navigation Right -->
	{#if hasNext}
		<button
			class="absolute right-4 top-1/2 z-50 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white hover:bg-white/20"
			onclick={next}
		>
			<ChevronRight class="h-8 w-8" />
			<span class="sr-only">Suivant</span>
		</button>
	{/if}
</div>
