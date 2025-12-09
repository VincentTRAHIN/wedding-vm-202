<script lang="ts">
	import { Checkbox as CheckboxPrimitive } from 'bits-ui';
	import { Check } from 'lucide-svelte';
	import { cn } from '$lib/utils';

	let {
		ref = $bindable(null),
		checked = $bindable(false),
		class: className = undefined,
		...restProps
	} = $props();
</script>

<CheckboxPrimitive.Root
	bind:ref
	bind:checked
	class={cn(
		'peer h-4 w-4 shrink-0 rounded-sm border border-stone-900 ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-stone-900 data-[state=checked]:text-stone-50',
		className
	)}
	{...restProps}
>
	{#snippet children({ checked })}
		<div class={cn('flex items-center justify-center text-current')}>
			{#if checked}
				<Check class="h-3.5 w-3.5" />
			{/if}
		</div>
	{/snippet}
</CheckboxPrimitive.Root>
