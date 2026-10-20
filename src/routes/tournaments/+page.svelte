<script lang="ts">
	import PageMeta from '#lib/components/PageMeta.svelte';
	import { resolve } from '$app/paths';
	import { getTournaments } from '#lib/data/client.ts';
	import { useResource } from '#lib/data/resource.svelte.ts';
	import { formatDateRange } from '#lib/format.ts';
	import DataView from '#lib/components/DataView.svelte';
	import PageTitle from '#lib/components/PageTitle.svelte';
	import TournamentCard from '#lib/components/TournamentCard.svelte';
	import StatusPill from '#lib/components/StatusPill.svelte';
	import EmptyState from '#lib/components/EmptyState.svelte';
	import LastUpdated from '#lib/components/LastUpdated.svelte';
	import FilterLayout from '#lib/components/FilterLayout.svelte';
	import FilterOptions from '#lib/components/FilterOptions.svelte';
	import FilterSelect from '#lib/components/FilterSelect.svelte';
	import ResultsToolbar from '#lib/components/ResultsToolbar.svelte';
	import type { ViewMode } from '#lib/components/ViewSwitch.svelte';
	import type { TournamentStatus, TournamentSummary } from '#lib/data/types.ts';

	const resource = useResource(getTournaments);

	type Status = 'all' | TournamentStatus;
	type Sort = 'live' | 'newest' | 'oldest' | 'name' | 'players';

	let status = $state<Status>('all');
	let year = $state('all');
	let sort = $state<Sort>('live');
	let view = $state<ViewMode>('cards');

	const statusOptions: { value: Status; label: string }[] = [
		{ value: 'all', label: 'All tournaments' },
		{ value: 'ongoing', label: 'Live' },
		{ value: 'upcoming', label: 'Upcoming' },
		{ value: 'completed', label: 'Completed' }
	];

	const sortOptions: { value: Sort; label: string }[] = [
		{ value: 'live', label: 'Live first' },
		{ value: 'newest', label: 'Newest first' },
		{ value: 'oldest', label: 'Oldest first' },
		{ value: 'name', label: 'Name' },
		{ value: 'players', label: 'Most players' }
	];

	const yearOf = (t: TournamentSummary) => t.startDate?.slice(0, 4) ?? '';
	const statusOrder = { ongoing: 0, upcoming: 1, completed: 2 } as const;
	const newest = (a: TournamentSummary, b: TournamentSummary) =>
		(b.startDate ?? '').localeCompare(a.startDate ?? '');
	const sorters: Record<Sort, (a: TournamentSummary, b: TournamentSummary) => number> = {
		live: (a, b) => statusOrder[a.status] - statusOrder[b.status] || newest(a, b),
		newest,
		oldest: (a, b) => -newest(a, b),
		name: (a, b) => a.name.localeCompare(b.name),
		players: (a, b) => (b.playerCount ?? 0) - (a.playerCount ?? 0) || newest(a, b)
	};

	const activeFilters = $derived((status !== 'all' ? 1 : 0) + (year !== 'all' ? 1 : 0));

	function visible(list: TournamentSummary[]) {
		return list
			.filter(
				(t) => (status === 'all' || t.status === status) && (year === 'all' || yearOf(t) === year)
			)
			.sort(sorters[sort]);
	}

	function years(list: TournamentSummary[]) {
		return [...new Set(list.map(yearOf).filter(Boolean))].sort().reverse();
	}

	function reset() {
		status = 'all';
		year = 'all';
	}
</script>

<PageMeta
	title="Tournaments"
	description="Every edition of The Ultimate Gamer LAN tournament: live standings, champions and results."
/>

<div class="container page">
	<PageTitle
		eyebrow="Archive"
		title="Tournaments"
		lead="Every edition of The Ultimate Gamer. Open one for its standings, schedule and results."
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
			{@const shown = visible(tournaments)}
			{@const yearList = years(tournaments)}
			<FilterLayout active={activeFilters} onreset={reset}>
				{#snippet filters()}
					<FilterOptions
						legend="Status"
						name="status"
						bind:value={status}
						options={statusOptions.map((o) => ({
							...o,
							count:
								o.value === 'all'
									? tournaments.length
									: tournaments.filter((t) => t.status === o.value).length
						}))}
					/>
					{#if yearList.length > 1}
						<FilterOptions
							legend="Year"
							name="year"
							bind:value={year}
							options={[
								{ value: 'all', label: 'All years' },
								...yearList.map((y) => ({
									value: y,
									label: y,
									count: tournaments.filter((t) => yearOf(t) === y).length
								}))
							]}
						/>
					{/if}
					<FilterSelect label="Sort by" bind:value={sort} options={sortOptions} />
				{/snippet}

				<ResultsToolbar
					shown={shown.length}
					total={tournaments.length}
					noun="tournaments"
					bind:view
				/>

				{#if !shown.length}
					<EmptyState
						title="No matching tournaments"
						message="No tournaments match these filters. Try clearing them."
					/>
				{:else if view === 'cards'}
					<div class="cards">
						{#each shown as tournament (tournament.slug)}
							<TournamentCard {tournament} />
						{/each}
					</div>
				{:else}
					<div class="panel table-scroll">
						<table class="data-table">
							<caption class="visually-hidden"
								>Tournaments, {sortOptions.find((o) => o.value === sort)?.label}</caption
							>
							<thead>
								<tr>
									<th scope="col">Tournament</th>
									<th scope="col">Status</th>
									<th scope="col">Dates</th>
									<th scope="col">Ultimate Gamer</th>
									<th scope="col">Leader</th>
									<th scope="col">Players</th>
									<th scope="col">Games</th>
									<th scope="col">Categories</th>
									<th scope="col">Awards</th>
								</tr>
							</thead>
							<tbody>
								{#each shown as t (t.slug)}
									{@const leader = t.leaders?.[0]}
									<tr>
										<th scope="row">
											<a class="t-name" href={resolve('/tournaments/[slug]', { slug: t.slug })}
												>{t.name}</a
											>
											{#if t.location}<span class="subtle sub">{t.location}</span>{/if}
										</th>
										<td><StatusPill status={t.status} demo={t.isDemo} /></td>
										<td class="nowrap">{formatDateRange(t.startDate, t.endDate) || '–'}</td>
										<td>
											{#if t.champion}
												<a
													class="champ"
													href={resolve('/players/[slug]', { slug: t.champion.slug })}
													><span aria-hidden="true">👑</span> {t.champion.name}</a
												>
											{:else}
												<span class="subtle"
													>{t.status === 'completed' ? 'Not recorded' : 'Undecided'}</span
												>
											{/if}
										</td>
										<td>
											{#if leader}
												<a href={resolve('/players/[slug]', { slug: leader.player.slug })}
													>{leader.player.name}</a
												>
												<span class="subtle num">{leader.points} pts</span>
											{:else}<span class="subtle">–</span>{/if}
										</td>
										<td class="num">{t.playerCount ?? '–'}</td>
										<td class="num">{t.gamesPlayed ?? '–'}</td>
										<td class="num nowrap">
											{#if t.categoriesCompleted != null}
												{t.categoriesCompleted}{t.categoriesPlanned
													? `/${t.categoriesPlanned}`
													: ''}
											{:else}–{/if}
										</td>
										<td class="num">{t.awards?.length ?? '–'}</td>
									</tr>
								{/each}
							</tbody>
						</table>
					</div>
				{/if}
			</FilterLayout>
		{/snippet}
	</DataView>
</div>

<style>
	.cards {
		display: grid;
		gap: var(--sp-4);
		grid-template-columns: repeat(auto-fill, minmax(min(100%, 18rem), 1fr));
	}

	.data-table a {
		text-decoration: none;
	}

	.t-name {
		font-family: var(--font-display);
		font-weight: 700;
		text-transform: uppercase;
		white-space: nowrap;
	}

	.sub {
		display: block;
		font-size: var(--fs-xs);
		font-weight: 400;
	}

	.nowrap {
		white-space: nowrap;
	}

	.champ {
		font-weight: 700;
		color: var(--c-gold-bright);
		white-space: nowrap;
	}
</style>
