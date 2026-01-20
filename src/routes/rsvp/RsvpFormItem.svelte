<script lang="ts">
	import { Label } from '$lib/components/ui/label';
	import { Textarea } from '$lib/components/ui/textarea';
	import { Checkbox } from '$lib/components/ui/checkbox';
	import { Check, X, Calendar } from 'lucide-svelte';
	import { cn } from '$lib/utils';

	let {
		guest,
		prefix = '',
		isRemovable = false,
		showMessage = false
	} = $props<{
		guest: {
			id: string;
			full_name: string;
			rsvp_status: string;
			present_saturday?: boolean;
			present_sunday?: boolean;
			dietary_restrictions?: string;
			message_for_couple?: string;
		};
		prefix?: string;
		isRemovable?: boolean;
		showMessage?: boolean;
	}>();

	let rsvpStatus = $state(guest.rsvp_status || 'present');
	let presentSaturday = $state(guest.present_saturday ?? true);
	let presentSunday = $state(guest.present_sunday ?? true);
</script>

<div class="mb-8 border-b border-stone-100 pb-8 last:mb-0 last:border-0 last:pb-0">
	<div class="mb-4 flex items-center justify-between">
		<h3 class="font-serif text-xl font-bold text-foreground">{guest.full_name}</h3>
		{#if isRemovable}
			<button
				type="submit"
				formaction="?/removeManagedGuest"
				name="guestId"
				value={guest.id}
				class="rounded-full p-1 text-muted-foreground transition-colors hover:bg-red-50 hover:text-red-500"
				aria-label="Retirer cet invité"
				title="Retirer de ma liste"
			>
				<X class="h-5 w-5" />
			</button>
		{/if}
	</div>

	<input type="hidden" name="{prefix}rsvp_status" value={rsvpStatus} />

	<!-- Presence Toggle -->
	<div class="mb-6 space-y-3">
		<Label class="text-base font-medium text-foreground">Sera présent(e) ?</Label>
		<div class="grid grid-cols-2 gap-4">
			<button
				type="button"
				class={cn(
					'relative flex flex-col items-center justify-center gap-2 rounded-xl border-2 p-4 transition-all',
					rsvpStatus === 'present'
						? 'border-primary bg-muted text-foreground'
						: 'border-border bg-background text-muted-foreground'
				)}
				onclick={() => (rsvpStatus = 'present')}
			>
				<div
					class={cn(
						'rounded-full p-2',
						rsvpStatus === 'present' ? 'bg-accent text-primary' : 'bg-muted text-muted-foreground'
					)}
				>
					<Check class="h-5 w-5" />
				</div>
				<span class="font-semibold">Oui</span>
			</button>

			<button
				type="button"
				class={cn(
					'relative flex flex-col items-center justify-center gap-2 rounded-xl border-2 p-4 transition-all',
					rsvpStatus === 'absent'
						? 'border-red-200 bg-red-50 text-red-900'
						: 'border-border bg-background text-muted-foreground'
				)}
				onclick={() => (rsvpStatus = 'absent')}
			>
				<div
					class={cn(
						'rounded-full p-2',
						rsvpStatus === 'absent' ? 'bg-red-100 text-red-700' : 'bg-muted text-muted-foreground'
					)}
				>
					<X class="h-5 w-5" />
				</div>
				<span class="font-semibold">Non</span>
			</button>
		</div>
	</div>

	{#if rsvpStatus === 'present'}
		<!-- Day presence checkboxes -->
		<div class="mb-6 space-y-3">
			<div class="flex items-center gap-2 text-base font-medium text-foreground">
				<Calendar class="h-4 w-4" />
				<span>Jours de présence</span>
			</div>
			<div class="space-y-3 rounded-lg border border-stone-200 bg-stone-50 p-4">
				<label class="flex cursor-pointer items-center gap-3">
					<Checkbox
						name="{prefix}present_saturday"
						checked={presentSaturday}
						onCheckedChange={(checked: boolean) => (presentSaturday = checked === true)}
					/>
					<span class="text-sm">
						<span class="font-medium">Samedi 18 juillet 2026</span>
						<span class="text-muted-foreground"> — Cérémonie & Soirée</span>
					</span>
				</label>
				<label class="flex cursor-pointer items-center gap-3">
					<Checkbox
						name="{prefix}present_sunday"
						checked={presentSunday}
						onCheckedChange={(checked: boolean) => (presentSunday = checked === true)}
					/>
					<span class="text-sm">
						<span class="font-medium">Dimanche 19 juillet 2026</span>
						<span class="text-muted-foreground"> — Brunch</span>
					</span>
				</label>
			</div>
		</div>

		<div class="space-y-3">
			<Label for="{prefix}dietary_restrictions">Restrictions alimentaires</Label>
			<Textarea
				name="{prefix}dietary_restrictions"
				id="{prefix}dietary_restrictions"
				placeholder="Allergies, régime végétarien..."
				value={guest.dietary_restrictions}
				class="resize-none"
			/>
		</div>

		{#if showMessage}
			<div class="mt-4 space-y-3">
				<Label for="{prefix}message_for_couple">Un petit mot pour les mariés ? 💕</Label>
				<Textarea
					name="{prefix}message_for_couple"
					id="{prefix}message_for_couple"
					placeholder="Ton message ici..."
					value={guest.message_for_couple}
					class="resize-none"
					rows={3}
				/>
			</div>
		{/if}
	{/if}
</div>
