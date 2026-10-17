<script lang="ts">
	import { resolve } from '$app/paths';
	import { getPlayers, getTournaments } from '#lib/data/client.ts';
	import { useResource } from '#lib/data/resource.svelte.ts';
	import DataView from '#lib/components/DataView.svelte';
	import PageTitle from '#lib/components/PageTitle.svelte';
	import PlayerAvatar from '#lib/components/PlayerAvatar.svelte';
	import StatusPill from '#lib/components/StatusPill.svelte';
	import { formatDateRange } from '#lib/format.ts';

	const tournaments = useResource(getTournaments);
	const players = useResource(getPlayers);
</script>

<svelte:head>
	<title>History · The Ultimate Gamer</title>
	<meta
		name="description"
		content="The Ultimate Gamer hall of champions and all-time player records."
	/>
</svelte:head>

<div class="container page">
	<PageTitle
		eyebrow="Hall of champions"
		title="History"
		lead="Every crowned Ultimate Gamer and the all-time records behind them."
	/>

	<section aria-labelledby="champs-title">
		<h2 id="champs-title" class="section-title">Champions</h2>
		<DataView
			resource={tournaments}
			isEmpty={(d) => d.tournaments.length === 0}
			emptyTitle="No tournaments yet"
			loadingRows={3}
		>
			{#snippet children({ tournaments: list })}
				{@const timeline = [...list].sort((a, b) =>
					(b.startDate ?? '').localeCompare(a.startDate ?? '')
				)}
				<ol class="timeline">
					{#each timeline as t (t.slug)}
						<li class:has-champ={t.champion}>
							<div class="when">
								<span class="date subtle">{formatDateRange(t.startDate, t.endDate)}</span>
								<StatusPill status={t.status} />
							</div>
							<div class="what">
								<a class="t-name" href={resolve('/tournaments/[slug]', { slug: t.slug })}
									>{t.name}</a
								>
								{#if t.champion}
									<a class="champ" href={resolve('/players/[slug]', { slug: t.champion.slug })}>
										<PlayerAvatar name={t.champion.name} size="sm" highlight="champion" />
										<span><span aria-hidden="true">👑</span> {t.champion.name}</span>
									</a>
								{:else}
									<span class="subtle">
										{t.status === 'completed'
											? 'Champion not recorded'
											: 'Crown still up for grabs'}
									</span>
								{/if}
							</div>
						</li>
					{/each}
				</ol>
			{/snippet}
		</DataView>
	</section>

	<section aria-labelledby="records-title">
		<h2 id="records-title" class="section-title">All-time records</h2>
		<DataView
			resource={players}
			isEmpty={(d) => d.players.length === 0}
			emptyTitle="No players yet"
			loadingRows={6}
		>
			{#snippet children({ players: list })}
				{@const ranked = [...list].sort(
					(a, b) =>
						(b.ultimateGamerWins ?? 0) - (a.ultimateGamerWins ?? 0) ||
						(b.gameWins ?? 0) - (a.gameWins ?? 0) ||
						a.name.localeCompare(b.name)
				)}
				<div class="panel table-scroll">
					<table class="data-table">
						<caption class="visually-hidden"
							>All-time player records, sorted by titles then game wins</caption
						>
						<thead>
							<tr>
								<th scope="col">Player</th>
								<th scope="col">Titles</th>
								<th scope="col">Challenger</th>
								<th scope="col">Game wins</th>
								<th scope="col">Podiums</th>
								<th scope="col">Tournaments</th>
								<th scope="col">Awards</th>
							</tr>
						</thead>
						<tbody>
							{#each ranked as p (p.slug)}
								<tr>
									<th scope="row">
										<a class="player" href={resolve('/players/[slug]', { slug: p.slug })}>
											<PlayerAvatar name={p.name} initials={p.initials} size="sm" />
											{p.name}
										</a>
									</th>
									<td class="num titles">{p.ultimateGamerWins ?? '–'}</td>
									<td class="num">{p.challengerAppearances ?? '–'}</td>
									<td class="num">{p.gameWins ?? '–'}</td>
									<td class="num">{p.podiumFinishes ?? '–'}</td>
									<td class="num">{p.tournamentsPlayed ?? '–'}</td>
									<td class="num">{p.awardCount ?? '–'}</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			{/snippet}
		</DataView>
	</section>
</div>

<style>
	.section-title {
		font-size: var(--fs-xl);
		text-transform: uppercase;
		letter-spacing: var(--tracking-wide);
		margin-bottom: var(--sp-4);
	}

	.timeline {
		list-style: none;
		margin: 0;
		padding: 0;
		display: grid;
		gap: 0;
		border-left: 2px solid var(--c-border-strong);
	}

	.timeline li {
		position: relative;
		display: grid;
		grid-template-columns: 14rem 1fr;
		gap: var(--sp-4);
		padding: var(--sp-4) var(--sp-5);
	}

	.timeline li::before {
		content: '';
		position: absolute;
		left: -7px;
		top: 1.45rem;
		width: 12px;
		height: 12px;
		border-radius: 50%;
		background: var(--c-bg);
		border: 2px solid var(--c-border-strong);
	}

	.timeline li.has-champ::before {
		background: var(--c-gold);
		border-color: var(--c-gold);
		box-shadow: 0 0 12px var(--c-gold);
	}

	.when {
		display: grid;
		justify-items: start;
		gap: var(--sp-1);
	}

	.date {
		font-size: var(--fs-xs);
	}

	.what {
		display: grid;
		gap: var(--sp-2);
	}

	.t-name {
		font-family: var(--font-display);
		font-size: var(--fs-xl);
		font-weight: 700;
		text-transform: uppercase;
		text-decoration: none;
	}

	.champ {
		display: inline-flex;
		align-items: center;
		gap: var(--sp-2);
		font-weight: 700;
		color: var(--c-gold-bright);
		text-decoration: none;
	}

	.player {
		display: inline-flex;
		align-items: center;
		gap: var(--sp-2);
		font-weight: 600;
		text-decoration: none;
	}

	.titles {
		color: var(--c-gold-bright);
		font-weight: 700;
	}

	@media (max-width: 640px) {
		.timeline li {
			grid-template-columns: 1fr;
			gap: var(--sp-2);
		}
	}
</style>
