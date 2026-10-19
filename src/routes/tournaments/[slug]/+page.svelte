<script lang="ts">
	import PageMeta from '#lib/components/PageMeta.svelte';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { getTournament } from '#lib/data/client.ts';
	import { useResource } from '#lib/data/resource.svelte.ts';
	import { formatDateRange } from '#lib/format.ts';
	import DataView from '#lib/components/DataView.svelte';
	import NotFoundState from '#lib/components/NotFoundState.svelte';
	import StatusPill from '#lib/components/StatusPill.svelte';
	import StaleNotice from '#lib/components/StaleNotice.svelte';
	import ChampionBanner from '#lib/components/ChampionBanner.svelte';
	import Leaderboard from '#lib/components/Leaderboard.svelte';
	import TournamentProgress from '#lib/components/TournamentProgress.svelte';
	import GameSelectionPanel from '#lib/components/GameSelectionPanel.svelte';
	import NemesisPairs from '#lib/components/NemesisPairs.svelte';
	import GameResultDetail from '#lib/components/GameResultDetail.svelte';
	import AwardBadge from '#lib/components/AwardBadge.svelte';
	import LastUpdated from '#lib/components/LastUpdated.svelte';
	import EmptyState from '#lib/components/EmptyState.svelte';
	import SidePanel from '#lib/components/SidePanel.svelte';
	import ShareButton from '#lib/components/ShareButton.svelte';
	import Tabs from '#lib/components/Tabs.svelte';
	import type { PageProps } from './$types';

	let { params }: PageProps = $props();

	const resource = useResource(() => params.slug, getTournament);
	const t = $derived(resource.data?.tournament);
	const notFound = $derived(resource.error?.kind === 'not-found' && !resource.data);

	let standingsTab = $state('standings');
	let playTab = $state('next');

	/** Game shown in the side panel. Links like /tournaments/x#game-3 open it directly. */
	let openGame = $state<number | null>(null);
	$effect(() => {
		const match = /^#game-(\d+)$/.exec(page.url.hash);
		if (match) openGame = Number(match[1]);
	});
	const shownGame = $derived(t?.games.find((g) => g.number === openGame) ?? null);
</script>

<PageMeta
	title={t ? t.name : notFound ? 'Tournament not found' : params.slug}
	description={t
		? `${t.name}: standings, schedule and results of The Ultimate Gamer LAN tournament.`
		: undefined}
/>

<div class="container page">
	<nav class="crumbs" aria-label="Breadcrumb">
		<a href={resolve('/tournaments')}>Tournaments</a>
		<span aria-hidden="true">/</span>
		<span aria-current="page">{t?.name ?? params.slug}</span>
	</nav>

	<DataView {resource} loadingRows={8} loadingLabel="Loading tournament…">
		{#snippet notFound()}
			<NotFoundState
				title="Tournament not found"
				message="There is no tournament with this address in the published data."
				backHref={resolve('/tournaments')}
				backLabel="All tournaments"
			/>
		{/snippet}

		{#snippet children({ tournament })}
			{@const champion = tournament.standings.find((s) => s.isChampion)}
			{@const dates = formatDateRange(tournament.startDate, tournament.endDate)}
			{@const hasNext = !!tournament.nextSelection || !!tournament.nextNemeses}
			{@const recordCount = (tournament.awards?.length ?? 0) + (tournament.records?.length ?? 0)}
			<header class="head">
				<p class="eyebrow">{tournament.edition ?? 'Tournament'}</p>
				<div class="title-row">
					<h1>{tournament.name}</h1>
					<ShareButton
						kind="tournament"
						slug={tournament.slug}
						title="{tournament.name} · The Ultimate Gamer"
					/>
				</div>
				<p class="meta">
					<StatusPill status={tournament.status} demo={tournament.isDemo} />
					{#if dates}<span class="subtle">{dates}</span>{/if}
					{#if tournament.location}<span class="subtle">· {tournament.location}</span>{/if}
					{#if tournament.playerCount}<span class="subtle">· {tournament.playerCount} players</span
						>{/if}
				</p>
				<StaleNotice
					generatedAt={resource.generatedAt}
					live={tournament.status === 'ongoing' && !champion}
				/>
			</header>

			{#if champion}
				<ChampionBanner
					{champion}
					tournamentName={tournament.name}
					decidingGame={tournament.games.find((g) => g.decidedTournament)}
				/>
			{/if}

			<div class="layout">
				<section class="panel standings" aria-label="Standings">
					<Tabs
						label="Standings"
						bind:selected={standingsTab}
						tabs={[
							{
								id: 'standings',
								label: tournament.status === 'completed' ? 'Final standings' : 'Standings'
							},
							...(recordCount
								? [{ id: 'awards', label: 'Awards & records', count: recordCount }]
								: [])
						]}
					>
						{#snippet aside()}
							<div class="standings-meta">
								{#if tournament.challengerThreshold != null}
									<span class="threshold">
										Challenger at <strong class="num">{tournament.challengerThreshold}</strong> pts
									</span>
								{/if}
								<LastUpdated
									generatedAt={resource.generatedAt}
									refreshing={resource.refreshing}
									error={resource.error}
								/>
							</div>
						{/snippet}

						{#snippet children(tab)}
							{#if tab === 'standings'}
								{#if tournament.standings.length}
									<Leaderboard
										standings={tournament.standings}
										threshold={tournament.challengerThreshold}
										pointsTable={tournament.pointsTable}
										caption="{tournament.name} standings"
									/>
								{:else}
									<div class="panel-body">
										<EmptyState title="No standings yet" message="No games have been recorded." />
									</div>
								{/if}
							{:else}
								<div class="panel-body extras">
									{#if tournament.awards?.length}
										<section aria-labelledby="aw-title">
											<h3 class="eyebrow" id="aw-title">Awards</h3>
											<ul class="list">
												{#each tournament.awards as grant, i (`${grant.award}-${grant.player.slug}-${i}`)}
													<li>
														<AwardBadge slug={grant.award} />
														<a href={resolve('/players/[slug]', { slug: grant.player.slug })}
															>{grant.player.name}</a
														>
														{#if grant.detail}<span class="subtle detail">{grant.detail}</span>{/if}
													</li>
												{/each}
											</ul>
										</section>
									{/if}
									{#if tournament.records?.length}
										<section aria-labelledby="rec-title">
											<h3 class="eyebrow" id="rec-title">Records</h3>
											<dl class="list records">
												{#each tournament.records as record, i (i)}
													<div>
														<dt class="subtle">{record.label}</dt>
														<dd>
															<span class="num">{record.value}</span>
															{#if record.player}
																·
																<a href={resolve('/players/[slug]', { slug: record.player.slug })}
																	>{record.player.name}</a
																>
															{/if}
														</dd>
													</div>
												{/each}
											</dl>
										</section>
									{/if}
								</div>
							{/if}
						{/snippet}
					</Tabs>
				</section>

				<section class="panel" aria-label="Next game and schedule">
					<Tabs
						label="Next game and schedule"
						bind:selected={playTab}
						tabs={[
							...(hasNext ? [{ id: 'next', label: 'Next game' }] : []),
							{
								id: 'schedule',
								label: 'Schedule',
								count: tournament.categoriesPlanned ? (tournament.categoriesCompleted ?? 0) : null
							}
						]}
					>
						{#snippet children(tab)}
							<div class="panel-body play">
								{#if tab === 'next'}
									{#if tournament.nextSelection}
										<GameSelectionPanel selection={tournament.nextSelection} />
									{/if}
									{#if tournament.nextNemeses}
										<NemesisPairs pairs={tournament.nextNemeses} />
									{/if}
								{:else if tournament.categories.length}
									{#if tournament.categoriesPlanned}
										<p class="subtle progress">
											<span class="num">{tournament.categoriesCompleted ?? 0}</span> of
											<span class="num">{tournament.categoriesPlanned}</span> categories played.
											{#if tournament.games.length}Pick a game to see its results.{/if}
										</p>
									{/if}
									<TournamentProgress
										categories={tournament.categories}
										onselect={(n) => (openGame = n)}
									/>
								{:else}
									<p class="subtle">No categories announced.</p>
								{/if}
							</div>
						{/snippet}
					</Tabs>
				</section>
			</div>

			<SidePanel
				open={!!shownGame}
				eyebrow={shownGame ? `Game ${shownGame.number} · ${tournament.name}` : undefined}
				title={shownGame?.game.name ?? ''}
				onclose={() => (openGame = null)}
			>
				{#if shownGame}<GameResultDetail result={shownGame} />{/if}
			</SidePanel>
		{/snippet}
	</DataView>
</div>

<style>
	.crumbs {
		display: flex;
		gap: var(--sp-2);
		font-size: var(--fs-sm);
		color: var(--c-text-subtle);
	}

	.crumbs a {
		color: var(--c-text-muted);
		text-decoration: none;
	}

	.head {
		display: grid;
		gap: var(--sp-3);
	}

	.head .eyebrow {
		color: var(--c-gold);
	}

	h1 {
		font-size: var(--fs-3xl);
		text-transform: uppercase;
		overflow-wrap: anywhere;
	}

	.title-row {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		gap: var(--sp-3);
	}

	.meta {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: var(--sp-2) var(--sp-3);
		font-size: var(--fs-sm);
	}

	.layout {
		display: grid;
		gap: var(--sp-5);
		grid-template-columns: minmax(0, 1fr) minmax(18rem, 24rem);
		align-items: start;
	}

	.standings {
		overflow: hidden;
	}

	.standings-meta {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: flex-end;
		gap: var(--sp-2) var(--sp-4);
	}

	.threshold {
		font-size: var(--fs-xs);
		color: var(--c-text-muted);
		white-space: nowrap;
	}

	.threshold strong {
		color: var(--c-challenger);
		font-size: var(--fs-sm);
	}

	.play {
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		gap: var(--sp-5);
	}

	.progress {
		font-size: var(--fs-sm);
	}

	.extras {
		display: grid;
		gap: var(--sp-5);
	}

	.extras section {
		display: grid;
		gap: var(--sp-3);
	}

	.list {
		list-style: none;
		margin: 0;
		padding: 0;
		display: grid;
		gap: var(--sp-3);
		font-size: var(--fs-sm);
	}

	.list li {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: var(--sp-2);
	}

	.list a {
		font-weight: 600;
		text-decoration: none;
	}

	.detail {
		font-size: var(--fs-xs);
	}

	.records dt {
		font-size: var(--fs-xs);
		text-transform: uppercase;
		letter-spacing: var(--tracking-wide);
	}

	.records dd {
		margin: 0;
	}

	@media (max-width: 1080px) {
		.layout {
			grid-template-columns: minmax(0, 1fr);
		}
	}

	@media (max-width: 600px) {
		.head {
			gap: var(--sp-2);
		}
	}
</style>
