<script lang="ts">
	import { resolve } from '$app/paths';
	import { siteConfig } from '#lib/config/site.ts';
	import { getLeaderboard } from '#lib/data/client.ts';
	import { useResource } from '#lib/data/resource.svelte.ts';
	import Leaderboard from '#lib/components/Leaderboard.svelte';
	import TournamentHero from '#lib/components/TournamentHero.svelte';
	import TournamentProgress from '#lib/components/TournamentProgress.svelte';
	import GameSelectionPanel from '#lib/components/GameSelectionPanel.svelte';
	import RecentResults from '#lib/components/RecentResults.svelte';
	import ChampionBanner from '#lib/components/ChampionBanner.svelte';
	import HowItWorks from '#lib/components/HowItWorks.svelte';
	import LastUpdated from '#lib/components/LastUpdated.svelte';
	import LoadingState from '#lib/components/LoadingState.svelte';
	import ErrorState from '#lib/components/ErrorState.svelte';
	import EmptyState from '#lib/components/EmptyState.svelte';

	const board = useResource(getLeaderboard);

	const data = $derived(board.data);
	const tournament = $derived(data?.tournament ?? null);
	const champion = $derived(data?.standings.find((s) => s.isChampion) ?? null);
	const decidingGame = $derived(data?.recentResults?.find((r) => r.decidedTournament) ?? null);
</script>

<svelte:head>
	<title>{tournament ? `${tournament.name} · Live standings` : siteConfig.name}</title>
</svelte:head>

<div class="container page home">
	<section class="hero" aria-labelledby="hero-title">
		<p class="eyebrow kicker">Multi-game LAN tournament</p>
		<h1 id="hero-title">
			<span class="the">The</span>
			<span class="ultimate">Ultimate Gamer</span>
		</h1>

		{#if board.status === 'loading'}
			<div class="hero-skeleton" aria-hidden="true"></div>
		{:else if tournament && data}
			<TournamentHero
				{tournament}
				standings={data.standings}
				currentCategory={data.currentCategory}
				currentGame={data.currentGame}
			/>
		{/if}
	</section>

	{#if board.status === 'error' && board.error}
		<ErrorState error={board.error} onretry={board.retry} />
	{:else if board.status === 'success' && data && !tournament}
		<EmptyState
			icon="🕹️"
			title="No tournament in progress"
			message="There is no active tournament right now. Browse previous tournaments while the next one is being prepared."
		>
			<a class="btn" href={resolve('/tournaments')}>All tournaments</a>
		</EmptyState>
	{/if}

	{#if champion && tournament}
		<ChampionBanner {champion} tournamentName={tournament.name} {decidingGame} />
	{/if}

	{#if board.status !== 'error' && (board.status === 'loading' || tournament)}
		<div class="dashboard">
			<section class="panel standings" aria-labelledby="standings-title">
				<div class="panel-header">
					<h2 class="panel-title" id="standings-title">
						{tournament?.status === 'completed' ? 'Final standings' : 'Current standings'}
					</h2>
					{#if board.status === 'success'}
						<LastUpdated
							generatedAt={board.generatedAt}
							refreshing={board.refreshing}
							error={board.error}
						/>
					{/if}
				</div>
				{#if board.status === 'loading'}
					<LoadingState rows={6} label="Loading current standings…" />
				{:else if data && data.standings.length > 0}
					<Leaderboard standings={data.standings} threshold={tournament?.challengerThreshold} />
				{:else}
					<div class="panel-body">
						<EmptyState
							title="No standings yet"
							message="Standings appear after the first game has been recorded."
						/>
					</div>
				{/if}
			</section>

			<aside class="side">
				{#if data?.nextSelection}
					<section class="panel" aria-labelledby="next-title">
						<div class="panel-header">
							<h2 class="panel-title" id="next-title">Next game</h2>
						</div>
						<div class="panel-body">
							<GameSelectionPanel selection={data.nextSelection} />
						</div>
					</section>
				{/if}

				<section class="panel" aria-labelledby="progress-title">
					<div class="panel-header">
						<h2 class="panel-title" id="progress-title">Categories</h2>
						{#if tournament?.categoriesPlanned}
							<span class="subtle num count"
								>{tournament.categoriesCompleted ?? 0}/{tournament.categoriesPlanned}</span
							>
						{/if}
					</div>
					<div class="panel-body">
						{#if board.status === 'loading'}
							<LoadingState rows={4} label="Loading categories…" />
						{:else if data && data.categories.length > 0}
							<TournamentProgress categories={data.categories} />
						{:else}
							<p class="subtle">The category order has not been announced yet.</p>
						{/if}
					</div>
				</section>
			</aside>
		</div>
	{/if}

	{#if data?.recentResults?.length}
		<section class="recent" aria-labelledby="recent-title">
			<div class="section-head">
				<h2 id="recent-title" class="section-title">Recent results</h2>
				{#if tournament}
					<a href={resolve('/tournaments/[slug]', { slug: tournament.slug })}>All games →</a>
				{/if}
			</div>
			<RecentResults results={data.recentResults.slice(0, 6)} />
		</section>
	{/if}

	<HowItWorks threshold={tournament?.challengerThreshold} />
</div>

<style>
	.home {
		gap: var(--sp-6);
	}

	.hero {
		position: relative;
		padding-top: var(--sp-5);
	}

	.kicker {
		color: var(--c-gold);
		margin-bottom: var(--sp-2);
	}

	h1 {
		display: grid;
		line-height: 0.88;
		text-transform: uppercase;
		margin-bottom: var(--sp-5);
	}

	.the {
		font-size: calc(var(--fs-hero) * 0.32);
		letter-spacing: var(--tracking-wider);
		color: var(--c-text-muted);
	}

	.ultimate {
		font-size: var(--fs-hero);
		font-weight: 800;
		letter-spacing: -0.01em;
		background: linear-gradient(180deg, #fff 30%, #c9c9cf);
		-webkit-background-clip: text;
		background-clip: text;
		color: transparent;
		overflow-wrap: anywhere;
	}

	.ultimate::after {
		content: '';
		display: block;
		width: 4.5rem;
		height: 4px;
		margin-top: var(--sp-4);
		background: var(--c-gold);
		box-shadow: 0 0 24px var(--c-gold);
	}

	.hero-skeleton {
		height: 8.5rem;
		border-radius: var(--radius-lg);
		border: var(--border);
		background: linear-gradient(90deg, var(--c-surface), var(--c-surface-2), var(--c-surface));
		background-size: 300% 100%;
		animation: shimmer 1.6s linear infinite;
	}

	.dashboard {
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

	.count {
		font-size: var(--fs-sm);
	}

	.section-head {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		gap: var(--sp-3);
		margin-bottom: var(--sp-4);
	}

	.section-title {
		font-size: var(--fs-xl);
		text-transform: uppercase;
		letter-spacing: var(--tracking-wide);
	}

	.section-head a {
		font-size: var(--fs-sm);
		color: var(--c-gold);
		text-decoration: none;
	}

	@media (min-width: 1800px) {
		.dashboard {
			grid-template-columns: minmax(0, 1fr) 28rem;
		}
	}

	@media (max-width: 1080px) {
		.dashboard {
			grid-template-columns: minmax(0, 1fr);
		}
		.side {
			grid-template-columns: repeat(auto-fit, minmax(min(100%, 20rem), 1fr));
			align-items: start;
		}
	}

	@keyframes shimmer {
		from {
			background-position: 100% 0;
		}
		to {
			background-position: -200% 0;
		}
	}
</style>
