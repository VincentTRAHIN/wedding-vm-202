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
		<Command.Root>
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
