<script lang="ts">
	import { enhance } from '$app/forms';
	import { Button } from '$lib/components/ui/button';
	import { Label } from '$lib/components/ui/label';
	import { Textarea } from '$lib/components/ui/textarea';
	import * as Card from '$lib/components/ui/card';
	import { toast } from 'svelte-sonner';
	import { Loader2, Minus, Plus, Check, X } from 'lucide-svelte';
	import { cn } from '$lib/utils';

	let { data, form } = $props();

	let isSubmitting = $state(false);
	let rsvpStatus = $state(data.guest?.rsvp_status || 'present');
	let adultsCount = $state(form?.data?.adults_count ?? data.guest?.adults_count ?? 1);
	let childrenCount = $state(form?.data?.children_count ?? data.guest?.children_count ?? 0);

	let guest = $derived(data.guest);

	function incrementAdults() {
		adultsCount++;
	}

	function decrementAdults() {
		if (adultsCount > 1) adultsCount--;
	}

	function incrementChildren() {
		childrenCount++;
	}

	function decrementChildren() {
		if (childrenCount > 0) childrenCount--;
	}

	// Extract first name
	let firstName = $derived(guest?.full_name?.split(' ')[0] ?? 'Invité');
</script>

<div
	class="flex min-h-[calc(100vh-3.5rem)] items-center justify-center bg-stone-50/50 py-8 px-4 sm:px-6"
>
	<Card.Root class="w-full max-w-lg border-stone-200 bg-white shadow-lg rounded-xl overflow-hidden">
		<div class="bg-white px-6 pt-8 pb-6 text-center">
			<h1 class="font-serif text-3xl font-bold text-sage-900 md:text-4xl">
				Répondez à l'invitation
			</h1>
			<p class="mt-2 text-sm text-stone-500">
				Veuillez confirmer votre présence avant le 1er Mai 2026
			</p>
			<p class="mt-6 text-lg font-medium text-sage-700">Bonjour, {firstName}</p>
		</div>

		<Card.Content class="p-6 pt-0">
			<form
				method="POST"
				action="?/update"
				use:enhance={() => {
					isSubmitting = true;
					return async ({ result, update }) => {
						isSubmitting = false;
						if (result.type === 'success') {
							toast.success('Votre réponse a été enregistrée !');
						} else if (result.type === 'failure') {
							toast.error("Une erreur est survenue lors de l'enregistrement.");
						}
						await update();
					};
				}}
				class="space-y-8"
			>
				<!-- Presence Toggle -->
				<div class="space-y-3">
					<Label class="text-base font-medium text-stone-700">Serez-vous des nôtres ?</Label>
					<div class="grid grid-cols-2 gap-4">
						<button
							type="button"
							class={cn(
								'relative flex flex-col items-center justify-center gap-2 rounded-xl border-2 p-4 transition-all hover:border-sage-200 focus:outline-none focus:ring-2 focus:ring-sage-500 focus:ring-offset-2',
								rsvpStatus === 'present'
									? 'border-sage-600 bg-sage-50 text-sage-900'
									: 'border-stone-100 bg-white text-stone-500'
							)}
							onclick={() => (rsvpStatus = 'present')}
						>
							<div
								class={cn(
									'rounded-full p-2',
									rsvpStatus === 'present'
										? 'bg-sage-100 text-sage-700'
										: 'bg-stone-100 text-stone-400'
								)}
							>
								<Check class="h-5 w-5" />
							</div>
							<span class="font-semibold">Oui, avec plaisir !</span>
						</button>

						<button
							type="button"
							class={cn(
								'relative flex flex-col items-center justify-center gap-2 rounded-xl border-2 p-4 transition-all hover:border-stone-300 focus:outline-none focus:ring-2 focus:ring-stone-500 focus:ring-offset-2',
								rsvpStatus === 'absent'
									? 'border-stone-600 bg-stone-50 text-stone-900'
									: 'border-stone-100 bg-white text-stone-500'
							)}
							onclick={() => (rsvpStatus = 'absent')}
						>
							<div
								class={cn(
									'rounded-full p-2',
									rsvpStatus === 'absent'
										? 'bg-stone-200 text-stone-700'
										: 'bg-stone-100 text-stone-400'
								)}
							>
								<X class="h-5 w-5" />
							</div>
							<span class="font-semibold">Non, malheureusement</span>
						</button>
					</div>
					<input type="hidden" name="rsvp_status" value={rsvpStatus} />
				</div>

				{#if rsvpStatus === 'present'}
					<div class="space-y-6 animate-in fade-in slide-in-from-top-4 duration-300">
						<!-- Adults Counter -->
						<div
							class="flex items-center justify-between rounded-lg border border-stone-100 bg-stone-50/50 p-4"
						>
							<div>
								<Label for="adults_count" class="text-base font-medium text-stone-900"
									>Adultes</Label
								>
								<p class="text-xs text-stone-500">Nombre d'invités adultes</p>
							</div>
							<div class="flex items-center gap-4">
								<Button
									type="button"
									variant="outline"
									size="icon"
									class="h-10 w-10 rounded-full border-stone-200 hover:bg-stone-100 hover:text-stone-900"
									onclick={decrementAdults}
									disabled={adultsCount <= 1}
								>
									<Minus class="h-4 w-4" />
								</Button>
								<span class="w-6 text-center text-xl font-semibold text-stone-900"
									>{adultsCount}</span
								>
								<Button
									type="button"
									variant="outline"
									size="icon"
									class="h-10 w-10 rounded-full border-stone-200 hover:bg-stone-100 hover:text-stone-900"
									onclick={incrementAdults}
								>
									<Plus class="h-4 w-4" />
								</Button>
								<input type="hidden" name="adults_count" value={adultsCount} />
							</div>
						</div>

						<!-- Children Counter -->
						<div
							class="flex items-center justify-between rounded-lg border border-stone-100 bg-stone-50/50 p-4"
						>
							<div>
								<Label for="children_count" class="text-base font-medium text-stone-900"
									>Enfants</Label
								>
								<p class="text-xs text-stone-500">Moins de 12 ans</p>
							</div>
							<div class="flex items-center gap-4">
								<Button
									type="button"
									variant="outline"
									size="icon"
									class="h-10 w-10 rounded-full border-stone-200 hover:bg-stone-100 hover:text-stone-900"
									onclick={decrementChildren}
									disabled={childrenCount <= 0}
								>
									<Minus class="h-4 w-4" />
								</Button>
								<span class="w-6 text-center text-xl font-semibold text-stone-900"
									>{childrenCount}</span
								>
								<Button
									type="button"
									variant="outline"
									size="icon"
									class="h-10 w-10 rounded-full border-stone-200 hover:bg-stone-100 hover:text-stone-900"
									onclick={incrementChildren}
								>
									<Plus class="h-4 w-4" />
								</Button>
								<input type="hidden" name="children_count" value={childrenCount} />
							</div>
						</div>

						<!-- Dietary Restrictions -->
						<div class="space-y-2">
							<Label for="dietary_restrictions" class="text-base font-medium text-stone-900"
								>Régimes alimentaires / Allergies</Label
							>
							<Textarea
								id="dietary_restrictions"
								name="dietary_restrictions"
								placeholder="Ex: Végétarien, Allergie aux arachides..."
								value={form?.data?.dietary_restrictions ?? guest?.dietary_restrictions ?? ''}
								class="min-h-[100px] resize-none border-stone-200 bg-stone-50 focus:border-sage-500 focus:ring-sage-500"
							/>
						</div>
					</div>
				{/if}

				<Button
					type="submit"
					class="w-full bg-sage-600 py-6 text-lg font-semibold text-white hover:bg-sage-700 shadow-md transition-all hover:shadow-lg"
					disabled={isSubmitting}
				>
					{#if isSubmitting}
						<Loader2 class="mr-2 h-5 w-5 animate-spin" />
					{/if}
					Confirmer ma réponse
				</Button>
			</form>
		</Card.Content>
	</Card.Root>
</div>
