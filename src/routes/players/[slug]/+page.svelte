<script lang="ts">
	import { resolve } from '$app/paths';
	import { getPlayer } from '#lib/data/client.ts';
	import { useResource } from '#lib/data/resource.svelte.ts';
	import DataView from '#lib/components/DataView.svelte';
	import NotFoundState from '#lib/components/NotFoundState.svelte';
	import PlayerAvatar from '#lib/components/PlayerAvatar.svelte';
	import CategoryBadge from '#lib/components/CategoryBadge.svelte';
	import AwardBadge from '#lib/components/AwardBadge.svelte';
	import StatusBadge from '#lib/components/StatusBadge.svelte';
	import LastUpdated from '#lib/components/LastUpdated.svelte';
	import SidePanel from '#lib/components/SidePanel.svelte';
	import Tabs from '#lib/components/Tabs.svelte';
	import { formatDate, ordinal } from '#lib/format.ts';
	import type { PlayerProfile } from '#lib/data/types.ts';
	import type { PageProps } from './$types';

	let { params }: PageProps = $props();

	const resource = useResource(() => params.slug, getPlayer);
	const player = $derived(resource.data?.player);
	const notFound = $derived(resource.error?.kind === 'not-found' && !resource.data);

	let infoTab = $state('awards');
	/** Tournament whose match history is shown in the side panel. */
	let openTournament = $state<string | null>(null);

	/** Group award grants per award for display: "Challenger ×2". */
	function awardCounts(p: PlayerProfile) {
		const groups = new Map<string, { award: string; count: number; details: string[] }>();
		for (const a of p.awards ?? []) {
			const group = groups.get(a.award) ?? { award: a.award, count: 0, details: [] };
			group.count++;
			if (a.detail) group.details.push(a.detail);
			groups.set(a.award, group);
		}
		return [...groups.values()];
	}

	function awardsIn(p: PlayerProfile, slug: string) {
		return (p.awards ?? []).filter((a) => a.tournament?.slug === slug);
	}
</script>

<svelte:head>
	<title
		>{player ? player.name : notFound ? 'Player not found' : 'Player'} · The Ultimate Gamer</title
	>
</svelte:head>

<div class="container page">
	<nav class="crumbs" aria-label="Breadcrumb">
		<a href={resolve('/players')}>Players</a>
		<span aria-hidden="true">/</span>
		<span aria-current="page">{player?.name ?? params.slug}</span>
	</nav>

	<DataView {resource} loadingRows={8} loadingLabel="Loading player…">
		{#snippet notFound()}
			<NotFoundState
				title="Player not found"
				message="There is no player with this address in the published data."
				backHref={resolve('/players')}
				backLabel="All players"
			/>
		{/snippet}

		{#snippet children({ player: p })}
			{@const titles = p.ultimateGamerWins ?? 0}
			{@const grouped = awardCounts(p)}
			{@const shownTournament = p.tournaments?.find((t) => t.tournament.slug === openTournament)}
			{@const shownMatches = (p.matches ?? []).filter((m) => m.tournament.slug === openTournament)}
			<header class="profile-head">
				<PlayerAvatar
					name={p.name}
					initials={p.initials}
					avatarUrl={p.avatarUrl}
					size="xl"
					highlight={titles > 0 ? 'champion' : null}
				/>
				<div class="id">
					<p class="eyebrow">Player profile</p>
					<h1>{p.name}</h1>
					<div class="tags">
						{#if titles > 0}<StatusBadge status="champion" />
							{#if titles > 1}<span class="num times">×{titles}</span>{/if}{/if}
						{#if p.current}
							<span class="current">
								Live: <strong class="num">{ordinal(p.current.rank)}</strong> in points (<strong
									class="num">{p.current.points}</strong
								>
								pts) in
								<a href={resolve('/tournaments/[slug]', { slug: p.current.tournament.slug })}
									>{p.current.tournament.name}</a
								>
							</span>
						{/if}
					</div>
				</div>
				<div class="head-actions">
					<LastUpdated
						generatedAt={resource.generatedAt}
						refreshing={resource.refreshing}
						error={resource.error}
					/>
				</div>
			</header>

			<dl class="stat-grid">
				<div class="stat gold">
					<dt class="stat-label">Ultimate Gamer</dt>
					<dd class="stat-value">{titles}</dd>
				</div>
				<div class="stat">
					<dt class="stat-label">Challenger</dt>
					<dd class="stat-value">{p.challengerAppearances ?? '–'}</dd>
				</div>
				<div class="stat">
					<dt class="stat-label">Tournaments</dt>
					<dd class="stat-value">{p.tournamentsPlayed ?? '–'}</dd>
				</div>
				<div class="stat">
					<dt class="stat-label" title="Best final placement. The champion counts as 1st.">
						Best finish
					</dt>
					<dd class="stat-value">{p.bestPlacement ? ordinal(p.bestPlacement) : '–'}</dd>
				</div>
			</dl>

			<div class="cols">
				<section class="panel" aria-labelledby="hist-title">
					<div class="panel-header">
						<h2 class="panel-title" id="hist-title">Tournament history</h2>
					</div>
					{#if p.tournaments?.length}
						{@const maxPts = Math.max(1, ...p.tournaments.map((t) => t.points ?? 0))}
						<div class="table-scroll">
							<table class="data-table history">
								<caption class="visually-hidden"
									>Tournaments played by {p.name}. Open a row for its games.</caption
								>
								<thead>
									<tr>
										<th scope="col">Tournament</th>
										<th scope="col" title="Final placement; the champion counts as 1st">Place</th>
										<th scope="col">Points</th>
										<th scope="col">Wins</th>
										<th scope="col">Podiums</th>
										<th scope="col">Awards</th>
										<th scope="col"><span class="visually-hidden">Games</span></th>
									</tr>
								</thead>
								<tbody>
									{#each p.tournaments as t (t.tournament.slug)}
										{@const awards = awardsIn(p, t.tournament.slug)}
										<tr class="clickable" onclick={() => (openTournament = t.tournament.slug)}>
											<th scope="row">
												<a
													href={resolve('/tournaments/[slug]', { slug: t.tournament.slug })}
													onclick={(e) => e.stopPropagation()}>{t.tournament.name}</a
												>
												{#if t.startDate}<span class="subtle date">{formatDate(t.startDate)}</span
													>{/if}
											</th>
											<td class="num place">
												{#if t.status === 'ongoing'}
													{t.placement ? ordinal(t.placement) : '–'}
													<span class="subtle live">live</span>
												{:else}
													{(t.finish ?? t.placement) ? ordinal((t.finish ?? t.placement)!) : '–'}
												{/if}
											</td>
											<td>
												<span class="pts-cell">
													<span class="num">{t.points ?? '–'}</span>
													{#if t.points != null}
														<span class="spark" aria-hidden="true">
															<span style:width="{(t.points / maxPts) * 100}%"></span>
														</span>
													{/if}
												</span>
											</td>
											<td class="num">{t.gamesWon ?? '–'}</td>
											<td class="num">{t.podiums ?? '–'}</td>
											<td>
												<span class="award-cell">
													{#each awards as a, i (`${a.award}-${i}`)}
														<AwardBadge slug={a.award} detail={a.detail} />
													{:else}
														<span class="subtle">–</span>
													{/each}
												</span>
											</td>
											<td class="open-cell">
												<button
													class="open"
													type="button"
													onclick={(e) => {
														e.stopPropagation();
														openTournament = t.tournament.slug;
													}}
												>
													Games <span aria-hidden="true">›</span>
													<span class="visually-hidden">in {t.tournament.name}</span>
												</button>
											</td>
										</tr>
									{/each}
								</tbody>
							</table>
						</div>
					{:else}
						<div class="panel-body"><p class="subtle">No tournament history recorded.</p></div>
					{/if}
				</section>

				<div class="side">
					<section class="panel" aria-label="Awards, category wins and Nemeses">
						<Tabs
							label="Awards, category wins and Nemeses"
							bind:selected={infoTab}
							tabs={[
								{ id: 'awards', label: 'Awards', count: p.awards?.length ?? 0 },
								{ id: 'categories', label: 'Categories', count: p.categoryWins?.length ?? 0 },
								{ id: 'nemeses', label: 'Nemeses' }
							]}
						>
							{#snippet children(tab)}
								<div class="panel-body">
									{#if tab === 'awards'}
										{#if grouped.length}
											<ul class="counts">
												{#each grouped as g (g.award)}
													<li>
														<AwardBadge slug={g.award} detail={g.details.join(' · ') || null} />
														<span class="num">×{g.count}</span>
													</li>
												{/each}
											</ul>
										{:else}
											<p class="subtle">No awards yet.</p>
										{/if}
									{:else if tab === 'categories'}
										{#if p.categoryWins?.length}
											<ul class="counts">
												{#each p.categoryWins as c (c.category)}
													<li>
														<CategoryBadge slug={c.category} /><span class="num">×{c.wins}</span>
													</li>
												{/each}
											</ul>
										{:else}
											<p class="subtle">No category wins yet.</p>
										{/if}
									{:else if p.nemesis || p.rivals?.length}
										<div class="nemesis">
											{#if p.nemesis}
												<p class="summary">
													Beat their Nemesis
													<strong class="num">{p.nemesis.defeated}</strong>
													{#if p.nemesis.timesAssigned}of
														<strong class="num">{p.nemesis.timesAssigned}</strong>{/if}
													times. Beaten <strong class="num">{p.nemesis.defeatedBy}</strong>
													{p.nemesis.defeatedBy === 1 ? 'time' : 'times'} as someone else’s Nemesis.
												</p>
											{/if}
											{#if p.rivals?.length}
												<table class="data-table">
													<caption class="visually-hidden">Nemesis rivalries</caption>
													<thead>
														<tr>
															<th scope="col">Rival</th>
															<th scope="col" title="Times {p.name} beat them as their Nemesis"
																>Beat</th
															>
															<th scope="col" title="Times they beat {p.name} as their Nemesis"
																>Beaten by</th
															>
														</tr>
													</thead>
													<tbody>
														{#each p.rivals as r (r.player.slug)}
															<tr>
																<th scope="row">
																	<a href={resolve('/players/[slug]', { slug: r.player.slug })}
																		>{r.player.name}</a
																	>
																</th>
																<td class="num">{r.nemesisWins}</td>
																<td class="num">{r.nemesisLosses}</td>
															</tr>
														{/each}
													</tbody>
												</table>
											{/if}
										</div>
									{:else}
										<p class="subtle">No Nemesis games yet.</p>
									{/if}
								</div>
							{/snippet}
						</Tabs>
					</section>

					{#if p.doubleDown || p.nominate}
						<section class="panel" aria-labelledby="tok-title">
							<div class="panel-header">
								<h2 class="panel-title" id="tok-title">Tokens</h2>
							</div>
							<dl class="panel-body kv">
								{#if p.doubleDown}
									<div>
										<dt>Double Downs used</dt>
										<dd class="num">{p.doubleDown.used}</dd>
									</div>
									<div>
										<dt>Double Down wins</dt>
										<dd class="num">{p.doubleDown.wins}</dd>
									</div>
								{/if}
								{#if p.nominate}
									<div>
										<dt>Nominations used</dt>
										<dd class="num">{p.nominate.used}</dd>
									</div>
									<div>
										<dt>Nominations selected</dt>
										<dd class="num">{p.nominate.selected}</dd>
									</div>
								{/if}
							</dl>
						</section>
					{/if}
				</div>
			</div>

			<SidePanel
				open={!!shownTournament}
				eyebrow="{p.name} · match history"
				title={shownTournament?.tournament.name ?? ''}
				onclose={() => (openTournament = null)}
			>
				{#if shownTournament}
					{#if shownMatches.length}
						<div class="table-scroll">
							<table class="data-table matches">
								<caption class="visually-hidden"
									>{p.name}’s games in {shownTournament.tournament.name}</caption
								>
								<thead>
									<tr>
										<th scope="col">Game</th>
										<th scope="col">Place</th>
										<th scope="col">Points</th>
									</tr>
								</thead>
								<tbody>
									{#each shownMatches as m (`${m.tournament.slug}-${m.gameNumber}`)}
										<tr class:won={m.placement === 1}>
											<th scope="row">
												<a
													href="{resolve('/tournaments/[slug]', {
														slug: m.tournament.slug
													})}#game-{m.gameNumber}">{m.game.name}</a
												>
												<span class="game-meta">
													<span class="subtle num">#{m.gameNumber}</span>
													<CategoryBadge slug={m.category} size="sm" iconOnly />
													{#if m.doubleDown}<span class="note dd">Double Down</span>{/if}
													{#if m.defeatedNemesis && m.nemesis}
														<span class="note nem">Beat Nemesis {m.nemesis.name}</span>
													{:else if m.nemesis}
														<span class="subtle">Nemesis: {m.nemesis.name}</span>
													{/if}
												</span>
											</th>
											<td class="num place">{ordinal(m.placement)}</td>
											<td class="num">+{m.points}</td>
										</tr>
									{/each}
								</tbody>
							</table>
						</div>
					{:else}
						<p class="subtle">No games recorded in this tournament yet.</p>
					{/if}
					<a
						class="btn"
						href={resolve('/tournaments/[slug]', { slug: shownTournament.tournament.slug })}
						>Open {shownTournament.tournament.name}</a
					>
				{/if}
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

	.profile-head {
		display: flex;
		align-items: center;
		gap: var(--sp-5);
		flex-wrap: wrap;
	}

	.id {
		flex: 1;
		min-width: min(100%, 14rem);
		display: grid;
		gap: var(--sp-2);
	}

	.id .eyebrow {
		color: var(--c-gold);
	}

	h1 {
		font-size: var(--fs-3xl);
		text-transform: uppercase;
		overflow-wrap: anywhere;
	}

	.tags {
		display: flex;
		align-items: center;
		gap: var(--sp-3);
		flex-wrap: wrap;
		font-size: var(--fs-sm);
	}

	.times {
		color: var(--c-gold);
		font-weight: 700;
	}

	.current {
		color: var(--c-text-muted);
	}

	.stat.gold .stat-value {
		color: var(--c-gold-bright);
	}

	dl {
		margin: 0;
	}

	dd {
		margin: 0;
	}

	.cols {
		display: grid;
		gap: var(--sp-5);
		grid-template-columns: minmax(0, 1fr) minmax(16rem, 24rem);
		align-items: start;
	}

	.side {
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		gap: var(--sp-5);
	}

	.data-table th[scope='row'] {
		font-weight: 600;
		text-align: left;
	}

	.data-table a {
		text-decoration: none;
	}

	.clickable {
		cursor: pointer;
		transition: background var(--t-fast);
	}

	.clickable:hover {
		background: rgb(255 255 255 / 0.03);
	}

	.date {
		display: block;
		font-size: var(--fs-xs);
		font-weight: 400;
	}

	.place {
		white-space: nowrap;
	}

	.live {
		font-size: var(--fs-xs);
		font-family: var(--font-sans);
	}

	.pts-cell {
		display: flex;
		align-items: center;
		gap: var(--sp-2);
	}

	.spark {
		width: 4rem;
		height: 4px;
		background: var(--c-surface-3);
		border-radius: 2px;
		overflow: hidden;
	}

	.spark span {
		display: block;
		height: 100%;
		background: var(--c-gold);
	}

	.award-cell {
		display: flex;
		flex-wrap: wrap;
		gap: 0.25rem;
	}

	.open-cell {
		text-align: right;
	}

	.open {
		padding: 0.25rem 0.5rem;
		background: none;
		border: var(--border-strong);
		border-radius: var(--radius-sm);
		font-size: var(--fs-xs);
		font-weight: 600;
		color: var(--c-text-muted);
		white-space: nowrap;
		cursor: pointer;
	}

	.open:hover {
		color: var(--c-gold-bright);
		border-color: var(--c-gold-line);
	}

	.counts {
		list-style: none;
		margin: 0;
		padding: 0;
		display: grid;
		gap: var(--sp-2);
	}

	.counts li {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--sp-2);
		font-size: var(--fs-sm);
	}

	.nemesis {
		display: grid;
		gap: var(--sp-4);
	}

	.summary {
		font-size: var(--fs-sm);
		color: var(--c-text-muted);
	}

	.summary strong {
		color: var(--c-text);
	}

	.kv {
		display: grid;
		gap: var(--sp-2);
	}

	.kv div {
		display: flex;
		justify-content: space-between;
		gap: var(--sp-3);
		font-size: var(--fs-sm);
	}

	.kv dt {
		color: var(--c-text-muted);
	}

	.kv dd {
		font-weight: 700;
	}

	.game-meta {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.3rem;
		margin-top: 0.2rem;
		font-size: var(--fs-xs);
		font-weight: 400;
	}

	.won .place {
		color: var(--c-gold);
		font-weight: 700;
	}

	.note {
		display: inline-block;
		padding: 0.05rem 0.35rem;
		border-radius: var(--radius-sm);
		font-weight: 600;
	}

	.note.dd {
		background: var(--c-gold-soft);
		color: var(--c-gold-bright);
	}

	.note.nem {
		background: rgb(169 139 255 / 0.15);
		color: var(--c-violet);
	}

	.btn {
		justify-self: start;
	}

	@media (max-width: 1000px) {
		.cols {
			grid-template-columns: minmax(0, 1fr);
		}
	}
</style>
