<script lang="ts">
	import { getTournaments } from '#lib/data/client.ts';
	import { useResource } from '#lib/data/resource.svelte.ts';
	import DataView from '#lib/components/DataView.svelte';
	import PageTitle from '#lib/components/PageTitle.svelte';
	import TournamentCard from '#lib/components/TournamentCard.svelte';
	import LastUpdated from '#lib/components/LastUpdated.svelte';

	const resource = useResource(getTournaments);

	const order = { ongoing: 0, upcoming: 1, completed: 2 } as const;
	function sorted<T extends { status: keyof typeof order; startDate?: string | null }>(list: T[]) {
		return [...list].sort(
			(a, b) =>
				order[a.status] - order[b.status] || (b.startDate ?? '').localeCompare(a.startDate ?? '')
		);
	}
</script>

<svelte:head>
	<title>Tournaments · The Ultimate Gamer</title>
	<meta
		name="description"
		content="Every edition of The Ultimate Gamer LAN tournament: champions, standings and results."
	/>
</svelte:head>

<div class="container page">
	<PageTitle
		eyebrow="Archive"
		title="Tournaments"
		lead="Every edition of The Ultimate Gamer — current, upcoming and completed."
	>
		{#snippet actions()}
			{#if resource.status === 'success'}
				<LastUpdated
					generatedAt={resource.generatedAt}
					refreshing={resource.refreshing}
					error={resource.error}
				/>
			{/if}
		{/snippet}
	</PageTitle>

	<DataView
		{resource}
		isEmpty={(d) => d.tournaments.length === 0}
		emptyTitle="No tournaments yet"
		emptyMessage="No tournaments have been published yet."
	>
		{#snippet children({ tournaments })}
			<div class="grid-cards">
				{#each sorted(tournaments) as tournament (tournament.slug)}
					<TournamentCard {tournament} />
				{/each}
			</div>
		{/snippet}
	</DataView>
</div>
