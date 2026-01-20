<script lang="ts">
	import { Check, ChevronsUpDown } from 'lucide-svelte';
	import * as Command from '$lib/components/ui/command';
	import * as Popover from '$lib/components/ui/popover';
	import { Button } from '$lib/components/ui/button';
	import { cn } from '$lib/utils';
	import { tick } from 'svelte';

	let {
		guests = [],
		value = $bindable(''),
		onSelect,
		placeholder = 'Sélectionner un invité...',
		emptyText = 'Aucun invité trouvé.'
	} = $props<{
		guests: { id: string; full_name: string }[];
		value?: string;
		onSelect?: (guest: { id: string; full_name: string }) => void;
		placeholder?: string;
		emptyText?: string;
	}>();

	let open = $state(false);
	let triggerRef = $state<HTMLButtonElement>(null!);

	let selectedGuest = $derived(guests.find((g: { id: string }) => g.id === value));

	function closeAndFocusTrigger() {
		open = false;
		tick().then(() => {
			triggerRef?.focus();
		});
	}

	// Normalize text for accent-insensitive search (fuzzy)
	function normalizeText(text: string): string {
		return text
			.toLowerCase()
			.normalize('NFD')
			.replace(/[\u0300-\u036f]/g, ''); // Remove diacritics
	}

	// Custom filter function for accent-insensitive search
	function accentInsensitiveFilter(value: string, search: string): number {
		const normalizedValue = normalizeText(value);
		const normalizedSearch = normalizeText(search);

		// Exact match
		if (normalizedValue === normalizedSearch) return 1;
		// Starts with search term
		if (normalizedValue.startsWith(normalizedSearch)) return 0.8;
		// Contains search term
		if (normalizedValue.includes(normalizedSearch)) return 0.6;
		// No match
		return 0;
	}
</script>

<Popover.Root bind:open>
	<Popover.Trigger bind:ref={triggerRef}>
		{#snippet child({ props })}
			<Button
				variant="outline"
				role="combobox"
				aria-expanded={open}
				class="w-full justify-between"
				{...props}
			>
				{selectedGuest ? selectedGuest.full_name : placeholder}
				<ChevronsUpDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
			</Button>
		{/snippet}
	</Popover.Trigger>
	<Popover.Content class="w-[300px] p-0">
		<Command.Root filter={accentInsensitiveFilter}>
			<Command.Input placeholder="Rechercher un invité..." />
			<Command.List>
				<Command.Empty>{emptyText}</Command.Empty>
				<Command.Group class="max-h-64 overflow-y-auto">
					{#each guests as guest (guest.id)}
						<Command.Item
							value={guest.full_name}
							onSelect={() => {
								value = guest.id;
								if (onSelect) onSelect(guest);
								closeAndFocusTrigger();
							}}
						>
							<Check class={cn('mr-2 h-4 w-4', value !== guest.id && 'text-transparent')} />
							{guest.full_name}
						</Command.Item>
					{/each}
				</Command.Group>
			</Command.List>
		</Command.Root>
	</Popover.Content>
</Popover.Root>
