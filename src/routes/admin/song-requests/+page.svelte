<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import * as Table from '$lib/components/ui/table';

	let { data } = $props();
	let { requests } = $derived(data);

	type RequestRow = (typeof requests)[number];

	function formatDate(value: RequestRow['created_at']) {
		try {
			return new Date(value).toLocaleString('fr-FR', {
				year: 'numeric',
				month: '2-digit',
				day: '2-digit',
				hour: '2-digit',
				minute: '2-digit'
			});
		} catch {
			return String(value);
		}
	}
</script>

<Card.Root>
	<Card.Header>
		<Card.Title>Propositions de musiques</Card.Title>
		<Card.Description>Liste des chansons proposées par les invités.</Card.Description>
	</Card.Header>
	<Card.Content>
		{#if requests.length === 0}
			<p class="text-sm text-muted-foreground">Aucune proposition pour le moment.</p>
		{:else}
			<div class="w-full overflow-x-auto">
				<div class="min-w-0 sm:min-w-[720px]">
					<Table.Root>
						<Table.Header>
							<Table.Row>
								<Table.Head>Titre</Table.Head>
								<Table.Head class="hidden sm:table-cell">Artiste</Table.Head>
								<Table.Head>Proposé par</Table.Head>
								<Table.Head class="hidden sm:table-cell">Date</Table.Head>
							</Table.Row>
						</Table.Header>
						<Table.Body>
							{#each requests as r (r.id)}
								<Table.Row>
									<Table.Cell class="font-medium">
										<div class="break-words">{r.track_name}</div>
										<div class="text-xs text-muted-foreground sm:hidden">
											Artiste: {r.artist ?? '—'}
											<span class="mx-1">•</span>
											{formatDate(r.created_at)}
										</div>
									</Table.Cell>
									<Table.Cell class="hidden sm:table-cell">{r.artist ?? '—'}</Table.Cell>
									<Table.Cell>{r.requested_by_name}</Table.Cell>
									<Table.Cell class="hidden sm:table-cell whitespace-nowrap"
										>{formatDate(r.created_at)}</Table.Cell
									>
								</Table.Row>
							{/each}
						</Table.Body>
					</Table.Root>
				</div>
			</div>
		{/if}
	</Card.Content>
</Card.Root>
