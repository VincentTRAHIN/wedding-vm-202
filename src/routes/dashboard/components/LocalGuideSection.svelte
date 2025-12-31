<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import { MapPin, Scissors, Car, ExternalLink } from 'lucide-svelte';
	import type { ComponentType } from 'svelte';

	type Item = {
		name: string;
		distance?: string;
		description?: string;
		address?: string;
		phone?: string;
		link?: string;
	};

	type Category = {
		title: string;
		icon: string;
		items: Item[];
	};

	type Content = {
		categories: Category[];
	};

	function isContent(value: unknown): value is Content {
		return (
			typeof value === 'object' &&
			value !== null &&
			Array.isArray((value as { categories?: unknown }).categories)
		);
	}

	let { content } = $props<{ content: unknown }>();
	let parsed = $derived(isContent(content) ? content : null);

	const icons: Record<string, ComponentType> = {
		MapPin,
		Scissors,
		Car
	};
</script>

<div class="space-y-6">
	<h2 class="font-serif text-2xl font-bold text-primary">Guide Local</h2>

	<div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
		{#if parsed?.categories}
			{#each parsed.categories as category (category.title)}
				<Card.Root>
					<Card.Header>
						<div class="flex items-center gap-2">
							{#if icons[category.icon]}
								{@const Icon = icons[category.icon]}
								<Icon class="h-5 w-5 text-sage-600" />
							{/if}
							<Card.Title class="text-lg">{category.title}</Card.Title>
						</div>
					</Card.Header>
					<Card.Content>
						<ul class="space-y-4">
							{#each category.items as item (item.name)}
								<li class="flex flex-col gap-1">
									<div class="flex items-center justify-between">
										<span class="font-medium">{item.name}</span>
										{#if item.distance}
											<span class="text-xs text-muted-foreground">{item.distance}</span>
										{/if}
									</div>
									{#if item.description}
										<p class="text-sm text-muted-foreground">{item.description}</p>
									{/if}
									{#if item.address}
										<p class="text-sm text-muted-foreground">{item.address}</p>
									{/if}
									{#if item.phone}
										<p class="text-sm text-muted-foreground">{item.phone}</p>
									{/if}
									{#if item.link}
										<a
											href={item.link}
											target="_blank"
											rel="noopener noreferrer"
											class="mt-1 flex items-center gap-1 text-xs font-medium text-sage-600 hover:underline"
										>
											Voir le site <ExternalLink class="h-3 w-3" />
										</a>
									{/if}
								</li>
							{/each}
						</ul>
					</Card.Content>
				</Card.Root>
			{/each}
		{/if}
	</div>
</div>
