<script lang="ts">
	import {
		X,
		ChevronLeft,
		ChevronRight,
		MessageCircle,
		Send,
		Heart,
		Trash2,
		Smile
	} from 'lucide-svelte';
	import { fade, scale } from 'svelte/transition';
	import { enhance } from '$app/forms';
	import { toast } from 'svelte-sonner';

	let { photos, initialIndex, supabase, user, onClose } = $props();

	let currentIndex = $state(initialIndex);
	let photo = $derived(photos[currentIndex]);
	let hasNext = $derived(currentIndex < photos.length - 1);
	let hasPrev = $derived(currentIndex > 0);

	let comments = $state<any[]>([]);
	let loadingComments = $state(false);
	let localCommentsCount = $state(0);
	let commentInput = $state<HTMLInputElement | null>(null);

	$effect(() => {
		localCommentsCount = photo.comments_count;
		loadComments();
	});

	async function loadComments() {
		loadingComments = true;
		try {
			const response = await fetch(`/api/comments?photoId=${photo.id}`);
			if (response.ok) {
				const data = await response.json();
				comments = data;
			} else {
				console.error('Failed to load comments');
				comments = [];
			}
		} catch (error) {
			console.error('Error loading comments:', error);
			comments = [];
		}
		loadingComments = false;
	}

	async function deleteComment(commentId: string) {
		const formData = new FormData();
		formData.append('commentId', commentId);

		const response = await fetch('?/deleteComment', {
			method: 'POST',
			body: formData
		});

		const result = await response.json();

		if (result.type === 'success') {
			comments = comments.filter((c) => c.id !== commentId);
			localCommentsCount--;
			toast.success('Commentaire supprimé');
		} else {
			toast.error('Erreur lors de la suppression');
		}
	}

	let showEmojiPicker = $state(false);

	const emojiCategories = [
		{
			name: 'Mariage & Amour',
			emojis: [
				'❤️',
				'🧡',
				'💍',
				'💎',
				'👰‍♀️',
				'🤵‍♂️',
				'💒',
				'💌',
				'💐',
				'🥂',
				'🍾',
				'💑',
				'💏',
				'💖',
				'💘',
				'💝',
				'💟',
				'🫶'
			]
		},
		{
			name: 'Fête',
			emojis: [
				'🎉',
				'🎊',
				'🎈',
				'🥳',
				'👯‍♀️',
				'💃',
				'🕺',
				'🎵',
				'🎶',
				'🎤',
				'🎂',
				'🍰',
				'🎁',
				'🕯️',
				'🍻',
				'🍸'
			]
		},
		{
			name: 'Émotions',
			emojis: [
				'😍',
				'🥰',
				'😘',
				'😂',
				'🤣',
				'🥹',
				'🥲',
				'🤩',
				'😮',
				'👏',
				'🙌',
				'👍',
				'🤝',
				'🙏',
				'💯',
				'🔥'
			]
		},
		{
			name: 'Nature',
			emojis: ['🌹', '🌺', '🌸', '🌼', '🌻', '🌿', '🍃', '☀️', '✨', '🌟', '🌙', '☁️']
		}
	];

	function toggleEmojiPicker() {
		showEmojiPicker = !showEmojiPicker;
	}

	function addEmoji(emoji: string) {
		if (commentInput) {
			commentInput.value += emoji;
			commentInput.focus();
		}
		showEmojiPicker = false;
	}

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

	function focusCommentInput() {
		commentInput?.focus();
	}
</script>

<svelte:window onkeydown={handleKeydown} />

<div
	class="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-0 md:p-8 backdrop-blur-sm"
	transition:fade={{ duration: 200 }}
	role="dialog"
	aria-modal="true"
>
	<!-- Close Button (Mobile: Top Right, Desktop: Outside) -->
	<button
		class="absolute right-4 top-4 z-[60] rounded-full bg-black/50 p-2 text-white hover:bg-white/20 md:right-8 md:top-8"
		onclick={onClose}
	>
		<X class="h-6 w-6" />
		<span class="sr-only">Fermer</span>
	</button>

	<!-- Navigation Left -->
	{#if hasPrev}
		<button
			class="absolute left-2 top-1/2 z-[60] -translate-y-1/2 rounded-full bg-black/50 p-2 text-white hover:bg-white/20 md:left-4"
			onclick={prev}
		>
			<ChevronLeft class="h-8 w-8" />
			<span class="sr-only">Précédent</span>
		</button>
	{/if}

	<!-- Navigation Right -->
	{#if hasNext}
		<button
			class="absolute right-2 top-1/2 z-[60] -translate-y-1/2 rounded-full bg-black/50 p-2 text-white hover:bg-white/20 md:right-4"
			onclick={next}
		>
			<ChevronRight class="h-8 w-8" />
			<span class="sr-only">Suivant</span>
		</button>
	{/if}

	<!-- Main Container (Instagram Style) -->
	<div
		class="flex h-full w-full max-w-6xl flex-col overflow-hidden bg-black md:h-[85vh] md:flex-row md:rounded-xl"
		onclick={(e) => e.stopPropagation()}
	>
		<!-- Left Column: Image -->
		<div class="relative flex flex-1 items-center justify-center bg-black">
			{#key photo.id}
				<img
					src={getPublicUrl(photo.storage_path)}
					alt={photo.caption || 'Photo'}
					class="max-h-full max-w-full object-contain"
					in:fade={{ duration: 200 }}
				/>
			{/key}
		</div>

		<!-- Right Column: Sidebar (Desktop) / Bottom Sheet (Mobile) -->
		<div class="flex w-full flex-col bg-white md:w-[400px] md:border-l md:border-stone-200">
			<!-- Header -->
			<div class="flex items-center gap-3 border-b border-stone-100 p-4">
				<div
					class="flex h-8 w-8 items-center justify-center rounded-full bg-sage-100 text-sage-700 font-bold text-xs"
				>
					{photo.guests?.full_name?.[0] || '?'}
				</div>
				<div class="font-bold text-sm text-stone-900">
					{photo.guests?.full_name || 'Invité'}
				</div>
			</div>

			<!-- Body: Comments List -->
			<div class="flex-1 overflow-y-auto p-4 space-y-4 bg-white">
				<!-- Caption as first item -->
				{#if photo.caption}
					<div class="flex gap-3">
						<div
							class="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-sage-100 text-sage-700 font-bold text-xs"
						>
							{photo.guests?.full_name?.[0] || '?'}
						</div>
						<div class="text-sm">
							<span class="font-bold mr-1">{photo.guests?.full_name || 'Invité'}</span>
							<span class="text-stone-800">{photo.caption}</span>
							<div class="mt-1 text-xs text-stone-400">
								{new Date(photo.created_at).toLocaleDateString()}
							</div>
						</div>
					</div>
				{/if}

				{#if loadingComments}
					<div class="flex justify-center py-4">
						<div
							class="h-6 w-6 animate-spin rounded-full border-2 border-sage-600 border-t-transparent"
						></div>
					</div>
				{:else if comments.length === 0 && !photo.caption}
					<div class="flex h-full flex-col items-center justify-center text-center text-stone-500">
						<p class="text-lg font-serif">Aucun commentaire</p>
						<p class="text-sm">Soyez le premier à réagir !</p>
					</div>
				{:else}
					{#each comments as comment}
						<div class="group flex gap-3">
							<div class="h-8 w-8 flex-shrink-0 overflow-hidden rounded-full bg-stone-200">
								{#if comment.guest?.avatar_url}
									<img
										src={comment.guest.avatar_url}
										alt={comment.guest.full_name}
										class="h-full w-full object-cover"
									/>
								{:else}
									<div
										class="flex h-full w-full items-center justify-center text-xs font-bold text-stone-500"
									>
										{comment.guest?.full_name?.[0] || '?'}
									</div>
								{/if}
							</div>
							<div class="flex-1 text-sm">
								<span class="font-bold mr-1">{comment.guest?.full_name || 'Invité'}</span>
								<span class="text-stone-800">{comment.content}</span>
								<div class="mt-1 text-xs text-stone-400">
									{new Date(comment.created_at).toLocaleDateString()}
								</div>
							</div>
							{#if user && (comment.user_id === user.id || user.email === 'admin@example.com')}
								<button
									class="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-stone-400 hover:text-red-500"
									onclick={() => deleteComment(comment.id)}
									aria-label="Supprimer le commentaire"
								>
									<Trash2 class="h-4 w-4" />
								</button>
							{/if}
						</div>
					{/each}
				{/if}
			</div>

			<!-- Footer: Actions & Input -->
			<div class="border-t border-stone-100 bg-white p-4">
				<!-- Actions Row -->
				<div class="flex items-center gap-4 mb-3">
					<form
						action="?/toggleLike"
						method="POST"
						use:enhance={() => {
							const wasLiked = photo.is_liked_by_user;
							photo.is_liked_by_user = !wasLiked;
							photo.likes_count += wasLiked ? -1 : 1;
							return async ({ result, update }) => {
								if (result.type === 'failure') {
									photo.is_liked_by_user = wasLiked;
									photo.likes_count += wasLiked ? 1 : -1;
									toast.error('Erreur lors du like');
								}
								await update({ reset: false });
							};
						}}
					>
						<input type="hidden" name="photoId" value={photo.id} />
						<button type="submit" class="transition-transform active:scale-90">
							<Heart
								class="h-7 w-7 transition-colors {photo.is_liked_by_user
									? 'fill-red-500 text-red-500'
									: 'text-stone-800 hover:text-stone-500'}"
							/>
						</button>
					</form>

					<button onclick={focusCommentInput} class="transition-transform active:scale-90">
						<MessageCircle class="h-7 w-7 text-stone-800 hover:text-stone-500" />
					</button>
				</div>

				<!-- Likes Count -->
				<div class="font-bold text-sm mb-1 text-stone-900">
					{photo.likes_count} J'aime
				</div>

				<!-- Date -->
				<div class="text-[10px] uppercase tracking-wide text-stone-400 mb-4">
					{new Date(photo.created_at).toLocaleDateString(undefined, {
						year: 'numeric',
						month: 'long',
						day: 'numeric'
					})}
				</div>

				<!-- Input Form -->
				<form
					action="?/addComment"
					method="POST"
					use:enhance={() => {
						return async ({ result, update }) => {
							if (result.type === 'success') {
								loadComments();
								localCommentsCount++;
								commentInput!.value = ''; // Clear input manually
							}
							await update({ reset: true });
						};
					}}
					class="relative flex items-center gap-2 border-t border-stone-100 pt-4"
				>
					{#if showEmojiPicker}
						<div
							class="absolute bottom-full left-0 mb-2 w-64 max-h-60 overflow-y-auto bg-white rounded-lg shadow-xl border border-stone-100 z-10"
							transition:scale={{ duration: 100, start: 0.9 }}
						>
							{#each emojiCategories as category}
								<div class="p-2">
									<div class="text-xs font-bold text-stone-500 mb-1 px-1">{category.name}</div>
									<div class="grid grid-cols-6 gap-1">
										{#each category.emojis as emoji}
											<button
												type="button"
												class="text-xl hover:bg-stone-100 p-1 rounded transition-colors flex items-center justify-center"
												onclick={() => addEmoji(emoji)}
											>
												{emoji}
											</button>
										{/each}
									</div>
								</div>
							{/each}
						</div>
					{/if}

					<button
						type="button"
						class="text-stone-400 hover:text-stone-600"
						onclick={toggleEmojiPicker}
					>
						<Smile class="h-6 w-6" />
					</button>

					<input type="hidden" name="photoId" value={photo.id} />
					<input
						bind:this={commentInput}
						type="text"
						name="content"
						placeholder="Ajouter un commentaire..."
						class="flex-1 bg-transparent text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none"
						required
						autocomplete="off"
					/>
					<button
						type="submit"
						class="text-sm font-bold text-sage-600 hover:text-sage-800 disabled:opacity-50"
					>
						Publier
					</button>
				</form>

				<!-- Emoji Picker (Hidden by default) -->
			</div>
		</div>
	</div>
</div>
