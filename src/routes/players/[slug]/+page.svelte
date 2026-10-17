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
	import EmptyState from '#lib/components/EmptyState.svelte';
	import { formatDate, ordinal } from '#lib/format.ts';
	import type { PageProps } from './$types';

	let { params }: PageProps = $props();

	const resource = useResource(() => params.slug, getPlayer);
	const player = $derived(resource.data?.player);
	const notFound = $derived(resource.error?.kind === 'not-found' && !resource.data);

	const MATCH_LIMIT = 25;
	let showAllMatches = $state(false);
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
								Now <strong class="num">{ordinal(p.current.rank)}</strong> with
								<strong class="num">{p.current.points}</strong> pts in
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
					<dt class="stat-label">Game wins</dt>
					<dd class="stat-value">{p.gameWins ?? '–'}</dd>
				</div>
				<div class="stat">
					<dt class="stat-label">Podiums</dt>
					<dd class="stat-value">{p.podiumFinishes ?? '–'}</dd>
				</div>
				<div class="stat">
					<dt class="stat-label">Best finish</dt>
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
							<table class="data-table">
								<thead>
									<tr>
										<th scope="col">Tournament</th>
										<th scope="col">Place</th>
										<th scope="col">Points</th>
										<th scope="col">Status</th>
									</tr>
								</thead>
								<tbody>
									{#each p.tournaments as t (t.tournament.slug)}
										<tr>
											<th scope="row">
												<a href={resolve('/tournaments/[slug]', { slug: t.tournament.slug })}
													>{t.tournament.name}</a
												>
												{#if t.startDate}<span class="subtle date">{formatDate(t.startDate)}</span
													>{/if}
											</th>
											<td class="num">
												{t.placement ? ordinal(t.placement) : '–'}
												{#if t.status === 'ongoing'}<span class="subtle live">(live)</span>{/if}
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
											<td>
												{#if t.wasChampion}<StatusBadge status="champion" size="sm" />
												{:else if t.wasChallenger}<StatusBadge status="challenger" size="sm" />
												{:else}<span class="subtle">–</span>{/if}
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
					<section class="panel" aria-labelledby="aw-title">
						<div class="panel-header"><h2 class="panel-title" id="aw-title">Awards</h2></div>
						<div class="panel-body">
							{#if p.awards?.length}
								<ul class="awards">
									{#each p.awards as a, i (`${a.award}-${i}`)}
										<li>
											<AwardBadge slug={a.award} detail={a.detail} />
											{#if a.tournament}<span class="subtle">{a.tournament.name}</span>{/if}
										</li>
									{/each}
								</ul>
							{:else}
								<p class="subtle">No awards yet.</p>
							{/if}
						</div>
					</section>

					{#if p.categoryWins?.length}
						<section class="panel" aria-labelledby="cw-title">
							<div class="panel-header">
								<h2 class="panel-title" id="cw-title">Category wins</h2>
							</div>
							<ul class="panel-body cat-wins">
								{#each p.categoryWins as c (c.category)}
									<li><CategoryBadge slug={c.category} /><span class="num">×{c.wins}</span></li>
								{/each}
							</ul>
						</section>
					{/if}

					{#if p.nemesis || p.doubleDown || p.nominate}
						<section class="panel" aria-labelledby="tok-title">
							<div class="panel-header">
								<h2 class="panel-title" id="tok-title">Nemesis & tokens</h2>
							</div>
							<dl class="panel-body kv">
								{#if p.nemesis}
									<div>
										<dt>Nemeses defeated</dt>
										<dd class="num">{p.nemesis.defeated}</dd>
									</div>
									<div>
										<dt>Defeated as Nemesis</dt>
										<dd class="num">{p.nemesis.defeatedBy}</dd>
									</div>
								{/if}
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

			{#if p.rivals?.length}
				<section class="panel" aria-labelledby="riv-title">
					<div class="panel-header">
						<h2 class="panel-title" id="riv-title">Nemesis rivalries</h2>
					</div>
					<div class="table-scroll">
						<table class="data-table">
							<thead>
								<tr>
									<th scope="col">Opponent</th>
									<th scope="col">Defeated them</th>
									<th scope="col">Defeated by them</th>
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
					</div>
				</section>
			{/if}

			<section class="panel" aria-labelledby="m-title">
				<div class="panel-header"><h2 class="panel-title" id="m-title">Match history</h2></div>
				{#if p.matches?.length}
					{@const matches = showAllMatches ? p.matches : p.matches.slice(0, MATCH_LIMIT)}
					<div class="table-scroll">
						<table class="data-table matches">
							<thead>
								<tr>
									<th scope="col">Game</th>
									<th scope="col">Category</th>
									<th scope="col">Place</th>
									<th scope="col">Points</th>
									<th scope="col">Notes</th>
								</tr>
							</thead>
							<tbody>
								{#each matches as m (`${m.tournament.slug}-${m.gameNumber}`)}
									<tr class:won={m.placement === 1}>
										<th scope="row">
											<a
												href="{resolve('/tournaments/[slug]', {
													slug: m.tournament.slug
												})}#game-{m.gameNumber}">{m.game.name}</a
											>
											<span class="subtle date">{m.tournament.name} · #{m.gameNumber}</span>
										</th>
										<td><CategoryBadge slug={m.category} size="sm" /></td>
										<td class="num place">{ordinal(m.placement)}</td>
										<td class="num">+{m.points}</td>
										<td class="notes">
											{#if m.doubleDown}<span class="note dd">Double Down</span>{/if}
											{#if m.defeatedNemesis && m.nemesis}
												<span class="note nem">Beat Nemesis {m.nemesis.name}</span>
											{:else if m.nemesis}
												<span class="subtle">Nemesis: {m.nemesis.name}</span>
											{/if}
										</td>
									</tr>
								{/each}
							</tbody>
						</table>
					</div>
					{#if p.matches.length > MATCH_LIMIT}
						<div class="panel-body more">
							<button class="btn" onclick={() => (showAllMatches = !showAllMatches)}>
								{showAllMatches ? 'Show fewer' : `Show all ${p.matches.length} games`}
							</button>
						</div>
					{/if}
				{:else}
					<div class="panel-body">
						<EmptyState title="No matches recorded" message="Game results will appear here." />
					</div>
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

	.profile-head {
		display: flex;
		align-items: center;
		gap: var(--sp-5);
		flex-wrap: wrap;
	}

	.id {
		flex: 1;
		min-width: 14rem;
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
		grid-template-columns: minmax(0, 1fr) minmax(16rem, 22rem);
		align-items: start;
	}

	.side {
		display: grid;
		gap: var(--sp-5);
	}

	.data-table th[scope='row'] {
		font-weight: 600;
		text-align: left;
	}

	.data-table a {
		text-decoration: none;
	}

	.date {
		display: block;
		font-size: var(--fs-xs);
		font-weight: 400;
	}

	.live {
		font-size: var(--fs-xs);
	}

	.pts-cell {
		display: flex;
		align-items: center;
		gap: var(--sp-2);
	}

	.spark {
		width: 5rem;
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

	.awards,
	.cat-wins {
		list-style: none;
		margin: 0;
		display: grid;
		gap: var(--sp-2);
	}

	.awards {
		padding: 0;
	}

	.awards li,
	.cat-wins li {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--sp-2);
		font-size: var(--fs-xs);
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

	.won .place {
		color: var(--c-gold);
		font-weight: 700;
	}

	.notes {
		font-size: var(--fs-xs);
	}

	.note {
		display: inline-block;
		padding: 0.05rem 0.35rem;
		margin-right: 0.25rem;
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

	.more {
		border-top: var(--border);
	}

	@media (max-width: 1000px) {
		.cols {
			grid-template-columns: minmax(0, 1fr);
		}
	}
</style>
