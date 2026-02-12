<script lang="ts">
	import { enhance } from '$app/forms';
	import { Button, buttonVariants } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import * as Dialog from '$lib/components/ui/dialog';
	import { toast } from 'svelte-sonner';
	import { Loader2, Upload, ImagePlus, X, Smile } from 'lucide-svelte';
	import { cn } from '$lib/utils';
	import imageCompression from 'browser-image-compression';

	let isUploading = $state(false);
	let isCompressing = $state(false);
	let isDialogOpen = $state(false);
	let selectedFiles: File[] = $state([]);
	let compressedFiles: Map<string, File> = $state(new Map());
	let previewUrls: string[] = $state([]);
	let compressionProgress = $state(0);
	let formElement: HTMLFormElement;
	let showEmojiPicker = $state(false);
	let captionInput = $state<HTMLInputElement>();

	const MAX_FILES = 10;

	// Instagram-style emoji picker (comprehensive list)
	const emojiCategories = {
		smileys: [
			'😀',
			'😃',
			'😄',
			'😁',
			'😅',
			'😂',
			'🤣',
			'😊',
			'😇',
			'🙂',
			'🙃',
			'😉',
			'😌',
			'😍',
			'🥰',
			'😘',
			'😗',
			'😙',
			'😚',
			'😋',
			'😛',
			'😝',
			'😜',
			'🤪',
			'🤨',
			'🧐',
			'🤓',
			'😎',
			'🥳',
			'😏',
			'😒',
			'😞',
			'😔',
			'😟',
			'😕',
			'🙁',
			'☹️',
			'😣',
			'😖',
			'😫',
			'😩',
			'🥺'
		],
		hearts: [
			'❤️',
			'🧡',
			'💛',
			'💚',
			'💙',
			'💜',
			'🖤',
			'🤍',
			'🤎',
			'💔',
			'❤️‍🔥',
			'❤️‍🩹',
			'❣️',
			'💕',
			'💞',
			'💓',
			'💗',
			'💖',
			'💘',
			'💝',
			'💟'
		],
		celebration: [
			'🎉',
			'🎊',
			'🎈',
			'🎁',
			'🎀',
			'🎂',
			'🍾',
			'🥂',
			'🍻',
			'🥳',
			'✨',
			'🎆',
			'🎇',
			'🧨',
			'🎃',
			'🎄',
			'🎋',
			'🎍',
			'🎑'
		],
		wedding: [
			'👰',
			'🤵',
			'💑',
			'💏',
			'👫',
			'👬',
			'👭',
			'💍',
			'💐',
			'🌹',
			'🌸',
			'🌺',
			'🌻',
			'🌷',
			'🏵️',
			'💒',
			'⛪'
		],
		nature: [
			'🌈',
			'☀️',
			'🌤️',
			'⛅',
			'🌥️',
			'☁️',
			'🌦️',
			'🌧️',
			'⛈️',
			'🌩️',
			'🌙',
			'⭐',
			'🌟',
			'✨',
			'💫',
			'⚡',
			'🔥',
			'💧',
			'🌊'
		],
		food: [
			'🍕',
			'🍔',
			'🍟',
			'🌭',
			'🍿',
			'🧂',
			'🥓',
			'🥚',
			'🧇',
			'🥞',
			'🧈',
			'🍞',
			'🥐',
			'🥖',
			'🫓',
			'🥨',
			'🥯',
			'🥗',
			'🍝',
			'🍜',
			'🍲',
			'🍛',
			'🍣',
			'🍱',
			'🥟',
			'🦪',
			'🍤',
			'🍙',
			'🍚',
			'🍘',
			'🍥',
			'🥠',
			'🥮',
			'🍢',
			'🍡',
			'🍧',
			'🍨',
			'🍦',
			'🥧',
			'🧁',
			'🍰',
			'🎂',
			'🍮',
			'🍭',
			'🍬',
			'🍫',
			'🍿',
			'🍩',
			'🍪',
			'🌰',
			'🥜'
		],
		gestures: [
			'👋',
			'🤚',
			'🖐️',
			'✋',
			'🖖',
			'👌',
			'🤌',
			'🤏',
			'✌️',
			'🤞',
			'🤟',
			'🤘',
			'🤙',
			'👈',
			'👉',
			'👆',
			'🖕',
			'👇',
			'☝️',
			'👍',
			'👎',
			'✊',
			'👊',
			'🤛',
			'🤜',
			'👏',
			'🙌',
			'👐',
			'🤲',
			'🤝',
			'🙏'
		]
	};

	const commonEmojis = [
		...emojiCategories.smileys.slice(0, 15),
		...emojiCategories.hearts.slice(0, 10),
		...emojiCategories.celebration,
		...emojiCategories.wedding,
		...emojiCategories.nature.slice(0, 12),
		...emojiCategories.gestures.slice(0, 8)
	];

	function handleFileSelect(event: Event) {
		const input = event.target as HTMLInputElement;
		if (input.files) {
			const newFiles = Array.from(input.files).slice(0, MAX_FILES);

			if (newFiles.length + selectedFiles.length > MAX_FILES) {
				toast.error(`Tu peux ajouter maximum ${MAX_FILES} photos à la fois`);
				return;
			}

			selectedFiles = [...selectedFiles, ...newFiles];
			previewUrls = selectedFiles.map((file) => URL.createObjectURL(file));
			compressedFiles = new Map();
		}
	}

	function removeFile(index: number) {
		selectedFiles = selectedFiles.filter((_, i) => i !== index);
		previewUrls = previewUrls.filter((_, i) => i !== index);
		// Clean up object URL
		URL.revokeObjectURL(previewUrls[index]);
	}

	function insertEmoji(emoji: string) {
		if (captionInput) {
			const start = captionInput.selectionStart || 0;
			const end = captionInput.selectionEnd || 0;
			const currentValue = captionInput.value;
			const newValue = currentValue.substring(0, start) + emoji + currentValue.substring(end);
			captionInput.value = newValue;
			// Move cursor after emoji
			const newCursorPos = start + emoji.length;
			captionInput.setSelectionRange(newCursorPos, newCursorPos);
			captionInput.focus();
		}
		showEmojiPicker = false;
	}

	async function compressFiles() {
		isCompressing = true;
		compressionProgress = 0;
		const newCompressedFiles = new Map<string, File>();

		const options = {
			maxSizeMB: 0.8,
			maxWidthOrHeight: 1920,
			useWebWorker: true,
			fileType: 'image/webp'
		};

		for (let i = 0; i < selectedFiles.length; i++) {
			const file = selectedFiles[i];
			try {
				const compressed = await imageCompression(file, options);
				newCompressedFiles.set(file.name, compressed);
				compressionProgress = Math.round(((i + 1) / selectedFiles.length) * 100);
			} catch (error) {
				console.error('Compression error:', error);
				toast.error(`Erreur lors de la compression de ${file.name}`);
			}
		}

		compressedFiles = newCompressedFiles;
		isCompressing = false;
		return newCompressedFiles;
	}
</script>

<Dialog.Root bind:open={isDialogOpen}>
	<Dialog.Trigger
		class={cn(
			buttonVariants({ variant: 'default' }),
			'fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg md:h-auto md:w-auto md:rounded-md md:px-4 md:py-2'
		)}
	>
		<ImagePlus class="h-6 w-6 md:mr-2" />
		<span class="hidden md:inline">Ajouter des photos</span>
	</Dialog.Trigger>
	<Dialog.Content class="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
		<Dialog.Header>
			<Dialog.Title>Ajouter des photos</Dialog.Title>
			<Dialog.Description>
				Partage tes meilleurs moments. Maximum {MAX_FILES} photos à la fois.
			</Dialog.Description>
		</Dialog.Header>
		<form
			bind:this={formElement}
			method="POST"
			action="?/upload"
			enctype="multipart/form-data"
			use:enhance={async ({ formData, cancel }) => {
				// Compress large files first
				const filesToCompress = selectedFiles.filter((f) => f.size > 1024 * 1024);

				if (filesToCompress.length > 0 && compressedFiles.size === 0) {
					cancel();
					await compressFiles();
					requestAnimationFrame(() => {
						formElement?.requestSubmit();
					});
					return;
				}

				// Replace with compressed versions
				formData.delete('photos[]');
				selectedFiles.forEach((file, index) => {
					const compressed = compressedFiles.get(file.name);
					if (compressed) {
						formData.append('photos[]', compressed, `image-${index}.webp`);
					} else {
						formData.append('photos[]', file);
					}
				});

				isUploading = true;
				return async ({ result, update }) => {
					isUploading = false;
					isCompressing = false;
					if (result.type === 'success') {
						toast.success(`${selectedFiles.length} photo(s) envoyée(s) avec succès !`);
						isDialogOpen = false;
						selectedFiles = [];
						compressedFiles = new Map();
						previewUrls = [];
					} else if (result.type === 'failure') {
						toast.error("Erreur lors de l'envoi.");
					}
					await update();
				};
			}}
			class="grid gap-4 py-4"
		>
			<div class="grid gap-2">
				<Label for="photos" class={selectedFiles.length > 0 ? 'sr-only' : ''}>Photos</Label>
				<div class="flex w-full items-center justify-center">
					<label
						for="photos"
						class={cn(
							'flex min-h-[200px] w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed transition-colors hover:bg-muted/50',
							isUploading || isCompressing ? 'cursor-not-allowed opacity-50' : '',
							selectedFiles.length > 0
								? 'border-primary/50 bg-muted/20'
								: 'border-muted-foreground/25'
						)}
					>
						{#if selectedFiles.length > 0}
						<div class="grid w-full grid-cols-2 gap-2 p-4 sm:grid-cols-3 md:grid-cols-4">
								{#each previewUrls as url, index}
									<div class="relative aspect-square group">
										<img
											src={url}
											alt="Preview {index + 1}"
											class="h-full w-full rounded-md object-cover"
										/>
										<button
											type="button"
											onclick={() => removeFile(index)}
											class="absolute -right-2 -top-2 rounded-full bg-destructive p-1 text-destructive-foreground opacity-0 transition-opacity group-hover:opacity-100"
											disabled={isUploading || isCompressing}
										>
											<X class="h-4 w-4" />
										</button>
									</div>
								{/each}
								{#if selectedFiles.length < MAX_FILES}
									<div
										class="flex aspect-square items-center justify-center rounded-md border-2 border-dashed border-muted-foreground/25"
									>
										<ImagePlus class="h-8 w-8 text-muted-foreground" />
									</div>
								{/if}
							</div>
						{:else}
							<div
								class="flex flex-col items-center justify-center pb-6 pt-5 text-muted-foreground"
							>
								<Upload class="mb-3 h-10 w-10" />
								<p class="mb-2 text-sm font-semibold">Clique pour choisir des photos</p>
								<p class="text-xs">JPG, PNG, WEBP - Max {MAX_FILES} photos</p>
							</div>
						{/if}
						<input
							id="photos"
							name="photos[]"
							type="file"
							accept="image/*"
							multiple
							class="hidden"
							onchange={handleFileSelect}
							disabled={isUploading || isCompressing}
						/>
					</label>
				</div>
			</div>

			{#if selectedFiles.length === 1}
				<div class="grid gap-2">
					<Label for="caption">Légende (optionnel)</Label>
					<div class="relative">
						<input
							bind:this={captionInput}
							id="caption"
							name="caption"
							placeholder="Ajoute une légende..."
							disabled={isUploading || isCompressing}
							class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 pr-10"
						/>
						<button
							type="button"
							onclick={() => (showEmojiPicker = !showEmojiPicker)}
							class="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
							disabled={isUploading || isCompressing}
						>
							<Smile class="h-5 w-5" />
						</button>
					</div>
					{#if showEmojiPicker}
						<div
							class="max-h-64 overflow-y-auto rounded-lg border border-stone-200 bg-white p-3 shadow-lg"
						>
							<div class="grid grid-cols-8 gap-2">
								{#each commonEmojis as emoji}
									<button
										type="button"
										onclick={() => insertEmoji(emoji)}
										class="flex h-8 w-8 items-center justify-center rounded hover:bg-muted text-xl transition-colors"
									>
										{emoji}
									</button>
								{/each}
							</div>
						</div>
					{/if}
				</div>
			{:else if selectedFiles.length > 1}
				<div class="rounded-md bg-blue-50 border border-blue-200 p-3 text-sm text-blue-800">
					📷 {selectedFiles.length} photos sélectionnées. Les légendes ne sont disponibles que pour les
					photos individuelles.
				</div>
			{/if}

			{#if isCompressing}
				<div class="space-y-1">
					<div class="flex justify-between text-xs text-muted-foreground">
						<span>Optimisation des images...</span>
						<span>{compressionProgress}%</span>
					</div>
					<div class="h-2 w-full overflow-hidden rounded-full bg-secondary">
						<div
							class="h-full bg-primary transition-all duration-300"
							style="width: {compressionProgress}%"
						></div>
					</div>
				</div>
			{/if}

			<Dialog.Footer>
				<Button type="submit" disabled={isUploading || isCompressing || selectedFiles.length === 0}>
					{#if isUploading}
						<Loader2 class="mr-2 h-4 w-4 animate-spin" />
						Envoi...
					{:else if isCompressing}
						<Loader2 class="mr-2 h-4 w-4 animate-spin" />
						Compression...
					{:else}
						Envoyer {selectedFiles.length > 0 ? `(${selectedFiles.length})` : ''}
					{/if}
				</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>
