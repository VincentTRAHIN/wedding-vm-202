<script lang="ts">
	import { enhance } from '$app/forms';
	import { Button, buttonVariants } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import * as Dialog from '$lib/components/ui/dialog';
	import { toast } from 'svelte-sonner';
	import { Loader2, Upload, ImagePlus } from 'lucide-svelte';
	import { cn } from '$lib/utils';
	import imageCompression from 'browser-image-compression';

	let isUploading = $state(false);
	let isCompressing = $state(false);
	let isDialogOpen = $state(false);
	let selectedFile: File | null = $state(null);
	let compressedFile: File | null = $state(null);
	let previewUrl: string | null = $state(null);
	let compressionProgress = $state(0);
	let formElement: HTMLFormElement;

	function handleFileSelect(event: Event) {
		const input = event.target as HTMLInputElement;
		if (input.files && input.files[0]) {
			selectedFile = input.files[0];
			compressedFile = null; // Reset compressed file on new selection
			previewUrl = URL.createObjectURL(selectedFile);
		}
	}

	async function compressAndSubmit(file: File) {
		isCompressing = true;
		compressionProgress = 0;

		const options = {
			maxSizeMB: 0.8,
			maxWidthOrHeight: 1920,
			useWebWorker: true,
			fileType: 'image/webp',
			onProgress: (progress: number) => {
				compressionProgress = progress;
			}
		};

		try {
			compressedFile = await imageCompression(file, options);
			// Once compressed, re-submit the form
			// The use:enhance hook will pick up the compressedFile
			requestAnimationFrame(() => {
				formElement?.requestSubmit();
			});
		} catch (error) {
			console.error('Compression error:', error);
			toast.error("Erreur lors de la compression de l'image.");
			isCompressing = false;
		}
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
		<span class="hidden md:inline">Ajouter une photo</span>
	</Dialog.Trigger>
	<Dialog.Content class="sm:max-w-[425px]">
		<Dialog.Header>
			<Dialog.Title>Ajouter une photo</Dialog.Title>
			<Dialog.Description>
				Partagez vos meilleurs moments. La photo sera visible après validation.
			</Dialog.Description>
		</Dialog.Header>
		<form
			bind:this={formElement}
			method="POST"
			action="?/upload"
			enctype="multipart/form-data"
			use:enhance={({ formData, cancel }) => {
				const file = formData.get('photo') as File;

				// Check if we need compression and haven't done it yet
				if (file && file.size > 1024 * 1024 && !compressedFile) {
					cancel();
					compressAndSubmit(file);
					return;
				}

				// If we have a compressed file, use it instead
				if (compressedFile) {
					formData.set('photo', compressedFile, 'image.webp');
					isCompressing = false; // Ensure compressing state is off
				}

				isUploading = true;
				return async ({ result, update }) => {
					isUploading = false;
					isCompressing = false;
					if (result.type === 'success') {
						toast.success('Photo envoyée avec succès !');
						isDialogOpen = false;
						selectedFile = null;
						compressedFile = null;
						previewUrl = null;
					} else if (result.type === 'failure') {
						toast.error("Erreur lors de l'envoi.");
					}
					await update();
				};
			}}
			class="grid gap-4 py-4"
		>
			<div class="grid gap-2">
				<Label for="photo">Photo</Label>
				<Input
					id="photo"
					name="photo"
					type="file"
					accept="image/*"
					required
					onchange={handleFileSelect}
					disabled={isUploading || isCompressing}
				/>
			</div>

			{#if previewUrl}
				<div class="relative aspect-video w-full overflow-hidden rounded-md border bg-muted">
					<img src={previewUrl} alt="Preview" class="h-full w-full object-cover" />
				</div>
			{/if}

			<div class="grid gap-2">
				<Label for="caption">Légende (optionnel)</Label>
				<Input
					id="caption"
					name="caption"
					placeholder="Qui est sur la photo ?"
					disabled={isUploading || isCompressing}
				/>
			</div>

			{#if isCompressing}
				<div class="space-y-1">
					<div class="flex justify-between text-xs text-muted-foreground">
						<span>Optimisation de l'image...</span>
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
				<Button type="submit" disabled={isUploading || isCompressing || !selectedFile}>
					{#if isUploading}
						<Loader2 class="mr-2 h-4 w-4 animate-spin" />
						Envoi...
					{:else if isCompressing}
						<Loader2 class="mr-2 h-4 w-4 animate-spin" />
						Compression...
					{:else}
						Envoyer
					{/if}
				</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>
