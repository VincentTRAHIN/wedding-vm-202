<script lang="ts">
	import { page } from '$app/stores';
	import { Button } from '$lib/components/ui/button';
	import { Users, Image } from 'lucide-svelte';

	let { children } = $props();

	const tabs = [
		{ href: '/admin/guests', label: 'Invités', icon: Users },
		{ href: '/admin/photos', label: 'Photos', icon: Image }
	];
</script>

<div class="container py-8">
	<div class="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
		<div>
			<h1 class="font-serif text-3xl font-bold text-primary">Administration</h1>
			<p class="text-muted-foreground">Gérez les invités et modérez les photos.</p>
		</div>
		<div class="flex gap-2">
			{#each tabs as tab}
				<Button
					href={tab.href}
					variant={$page.url.pathname === tab.href ? 'default' : 'outline'}
					size="sm"
				>
					<tab.icon class="mr-2 h-4 w-4" />
					{tab.label}
				</Button>
			{/each}
		</div>
	</div>

	{@render children()}
</div>
