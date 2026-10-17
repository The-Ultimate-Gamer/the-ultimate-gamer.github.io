<script lang="ts">
	import { resolve } from '$app/paths';
	import { getTournament } from '#lib/data/client.ts';
	import { useResource } from '#lib/data/resource.svelte.ts';
	import DataView from '#lib/components/DataView.svelte';
	import NotFoundState from '#lib/components/NotFoundState.svelte';
	import TournamentHero from '#lib/components/TournamentHero.svelte';
	import ChampionBanner from '#lib/components/ChampionBanner.svelte';
	import Leaderboard from '#lib/components/Leaderboard.svelte';
	import TournamentProgress from '#lib/components/TournamentProgress.svelte';
	import GameSelectionPanel from '#lib/components/GameSelectionPanel.svelte';
	import RecentResults from '#lib/components/RecentResults.svelte';
	import AwardBadge from '#lib/components/AwardBadge.svelte';
	import LastUpdated from '#lib/components/LastUpdated.svelte';
	import EmptyState from '#lib/components/EmptyState.svelte';
	import type { PageProps } from './$types';

	let { params }: PageProps = $props();

	const resource = useResource(() => params.slug, getTournament);
	const t = $derived(resource.data?.tournament);
	const notFound = $derived(resource.error?.kind === 'not-found' && !resource.data);
</script>

<svelte:head>
	<title>{t ? t.name : notFound ? 'Tournament not found' : 'Tournament'} · The Ultimate Gamer</title
	>
</svelte:head>

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
			<header class="head">
				<p class="eyebrow">{tournament.edition ?? 'Tournament'}</p>
				<h1>{tournament.name}</h1>
				<TournamentHero
					{tournament}
					standings={tournament.standings}
					currentCategory={tournament.currentCategory}
					currentGame={tournament.currentGame}
					showName={false}
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
				<section class="panel standings" aria-labelledby="st-title">
					<div class="panel-header">
						<h2 class="panel-title" id="st-title">
							{tournament.status === 'completed' ? 'Final leaderboard' : 'Standings'}
						</h2>
						<LastUpdated
							generatedAt={resource.generatedAt}
							refreshing={resource.refreshing}
							error={resource.error}
						/>
					</div>
					{#if tournament.standings.length}
						<Leaderboard
							standings={tournament.standings}
							threshold={tournament.challengerThreshold}
							caption="{tournament.name} standings"
						/>
					{:else}
						<div class="panel-body">
							<EmptyState title="No standings yet" message="No games have been recorded." />
						</div>
					{/if}
				</section>

				<aside class="side">
					{#if tournament.nextSelection}
						<section class="panel" aria-labelledby="next-title">
							<div class="panel-header"><h2 class="panel-title" id="next-title">Next game</h2></div>
							<div class="panel-body">
								<GameSelectionPanel selection={tournament.nextSelection} />
							</div>
						</section>
					{/if}
					<section class="panel" aria-labelledby="cat-title">
						<div class="panel-header"><h2 class="panel-title" id="cat-title">Categories</h2></div>
						<div class="panel-body">
							{#if tournament.categories.length}
								<TournamentProgress categories={tournament.categories} />
							{:else}
								<p class="subtle">No categories announced.</p>
							{/if}
						</div>
					</section>

					{#if tournament.awards?.length}
						<section class="panel" aria-labelledby="aw-title">
							<div class="panel-header"><h2 class="panel-title" id="aw-title">Awards</h2></div>
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
						<section class="panel" aria-labelledby="rec-title">
							<div class="panel-header"><h2 class="panel-title" id="rec-title">Records</h2></div>
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
				</aside>
			</div>

			<section aria-labelledby="games-title">
				<h2 id="games-title" class="section-title">Game by game</h2>
				{#if tournament.games.length}
					<RecentResults results={tournament.games} podium={8} linkTournament={false} />
				{:else}
					<EmptyState
						title="No games played yet"
						message="Results appear here once games are recorded."
					/>
				{/if}
			</section>
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
		margin-bottom: var(--sp-2);
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

	.side {
		display: grid;
		gap: var(--sp-5);
	}

	.list {
		list-style: none;
		margin: 0;
		padding: var(--sp-3) var(--sp-5);
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

	.section-title {
		font-size: var(--fs-xl);
		text-transform: uppercase;
		letter-spacing: var(--tracking-wide);
		margin-bottom: var(--sp-4);
	}

	@media (max-width: 1080px) {
		.layout {
			grid-template-columns: minmax(0, 1fr);
		}
	}
</style>
