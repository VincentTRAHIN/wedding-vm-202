<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Phone, Car } from 'lucide-svelte';

	type Contact = { name: string; role: string | undefined; phone: string };
	type Taxi = { name: string; phone: string; available_24h: boolean | undefined };

	let { contactsSos, taxis } = $props<{ contactsSos: unknown; taxis: unknown }>();

	function parseContacts(value: unknown): Contact[] {
		if (!value || typeof value !== 'object') return [];
		const contacts = (value as { contacts?: unknown }).contacts;
		if (!Array.isArray(contacts)) return [];
		return contacts
			.map((c) => {
				if (!c || typeof c !== 'object') return null;
				const name = (c as { name?: unknown }).name;
				const role = (c as { role?: unknown }).role;
				const phone = (c as { phone?: unknown }).phone;
				if (typeof name !== 'string' || typeof phone !== 'string') return null;
				return { name, role: typeof role === 'string' ? role : undefined, phone };
			})
			.filter((c): c is Contact => Boolean(c));
	}

	function parseTaxis(value: unknown): Taxi[] {
		if (!value || typeof value !== 'object') return [];
		const list = (value as { taxis?: unknown }).taxis;
		if (!Array.isArray(list)) return [];
		return list
			.map((t) => {
				if (!t || typeof t !== 'object') return null;
				const name = (t as { name?: unknown }).name;
				const phone = (t as { phone?: unknown }).phone;
				const available = (t as { available_24h?: unknown }).available_24h;
				if (typeof name !== 'string' || typeof phone !== 'string') return null;
				return {
					name,
					phone,
					available_24h: typeof available === 'boolean' ? available : undefined
				};
			})
			.filter((t): t is Taxi => Boolean(t));
	}

	let contacts = $derived(parseContacts(contactsSos));
	let taxisList = $derived(parseTaxis(taxis));
</script>

<div class="space-y-6">
	<h2 class="font-serif text-2xl font-bold text-primary">Contacts & SOS</h2>

	<div class="grid gap-6 md:grid-cols-2">
		<Card.Root>
			<Card.Header>
				<Card.Title>Contacts d'urgence</Card.Title>
				<Card.Description>En cas de besoin le jour J.</Card.Description>
			</Card.Header>
			<Card.Content class="space-y-3">
				{#if contacts.length === 0}
					<p class="text-sm text-muted-foreground">Aucun contact configuré.</p>
				{:else}
					{#each contacts as c (`${c.phone}|${c.name}|${c.role ?? ''}`)}
						<div class="flex items-center justify-between gap-3 rounded-md bg-stone-50 p-3">
							<div>
								<p class="font-medium">{c.name}</p>
								{#if c.role}
									<p class="text-sm text-muted-foreground">{c.role}</p>
								{/if}
							</div>
							<Button variant="outline" size="sm" class="gap-2" href={`tel:${c.phone}`}>
								<Phone class="h-4 w-4" />
								Appeler
							</Button>
						</div>
					{/each}
				{/if}
			</Card.Content>
		</Card.Root>

		<Card.Root>
			<Card.Header>
				<Card.Title>Taxis</Card.Title>
				<Card.Description>Options de transport locales.</Card.Description>
			</Card.Header>
			<Card.Content class="space-y-3">
				{#if taxisList.length === 0}
					<p class="text-sm text-muted-foreground">Aucun taxi configuré.</p>
				{:else}
					{#each taxisList as t (`${t.phone}|${t.name}`)}
						<div class="flex items-center justify-between gap-3 rounded-md bg-stone-50 p-3">
							<div>
								<p class="font-medium">{t.name}</p>
								{#if t.available_24h}
									<p class="text-sm text-muted-foreground">Disponible 24h/24</p>
								{/if}
							</div>
							<Button variant="outline" size="sm" class="gap-2" href={`tel:${t.phone}`}>
								<Car class="h-4 w-4" />
								Appeler
							</Button>
						</div>
					{/each}
				{/if}
			</Card.Content>
		</Card.Root>
	</div>
</div>
