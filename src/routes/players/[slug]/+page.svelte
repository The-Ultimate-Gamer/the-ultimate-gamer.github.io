<script lang="ts">
	import PageMeta from '#lib/components/PageMeta.svelte';
	import { resolve } from '$app/paths';
	import { getPlayer } from '#lib/data/client.ts';
	import { useResource } from '#lib/data/resource.svelte.ts';
	import DataView from '#lib/components/DataView.svelte';
	import NotFoundState from '#lib/components/NotFoundState.svelte';
	import PlayerAvatar from '#lib/components/PlayerAvatar.svelte';
	import CategoryBadge from '#lib/components/CategoryBadge.svelte';
	import StatusBadge from '#lib/components/StatusBadge.svelte';
	import StatusPill from '#lib/components/StatusPill.svelte';
	import LastUpdated from '#lib/components/LastUpdated.svelte';
	import SidePanel from '#lib/components/SidePanel.svelte';
	import ShareButton from '#lib/components/ShareButton.svelte';
	import Tabs from '#lib/components/Tabs.svelte';
	import EmptyState from '#lib/components/EmptyState.svelte';
	import ViewSwitch, { type ViewMode } from '#lib/components/ViewSwitch.svelte';
	import FilterSelect from '#lib/components/FilterSelect.svelte';
	import PlayerAwardsDetail from '#lib/components/PlayerAwardsDetail.svelte';
	import PlayerCategoriesDetail from '#lib/components/PlayerCategoriesDetail.svelte';
	import PlayerNemesesDetail from '#lib/components/PlayerNemesesDetail.svelte';
	import PlayerMatches from '#lib/components/PlayerMatches.svelte';
	import DiscordLink from '#lib/components/DiscordLink.svelte';
	import { getAwardContent } from '#lib/content/awards.ts';
	import { formatDate, ordinal, plural } from '#lib/format.ts';
	import type { PlayerProfile, PlayerTournamentEntry, TournamentStatus } from '#lib/data/types.ts';
	import type { PageProps } from './$types';

	let { params }: PageProps = $props();

	const resource = useResource(() => params.slug, getPlayer);
	const player = $derived(resource.data?.player);
	const notFound = $derived(resource.error?.kind === 'not-found' && !resource.data);

	type Topic = 'games' | 'awards' | 'categories' | 'nemeses';
	/** Side panel: a career topic, or one tournament (opened on a topic tab). */
	let panel = $state<{ topic: Topic; tournament?: string } | null>(null);
	let panelTab = $state<string>('games');

	function openCareer(topic: Exclude<Topic, 'games'>) {
		panel = { topic };
	}

	function openTournament(slug: string, topic: Topic = 'games') {
		panel = { topic, tournament: slug };
		panelTab = topic;
	}

	// Tournament list filters.
	type StatusFilter = 'all' | TournamentStatus;
	type Sort = 'newest' | 'oldest' | 'finish' | 'points';
	let status = $state<StatusFilter>('all');
	let sort = $state<Sort>('newest');
	let view = $state<ViewMode>('cards');

	const sortOptions: { value: Sort; label: string }[] = [
		{ value: 'newest', label: 'Newest first' },
		{ value: 'oldest', label: 'Oldest first' },
		{ value: 'finish', label: 'Best finish' },
		{ value: 'points', label: 'Most points' }
	];

	const finishOf = (t: PlayerTournamentEntry) => t.finish ?? t.placement ?? null;
	const newest = (a: PlayerTournamentEntry, b: PlayerTournamentEntry) =>
		(b.startDate ?? '').localeCompare(a.startDate ?? '');
	const sorters: Record<Sort, (a: PlayerTournamentEntry, b: PlayerTournamentEntry) => number> = {
		newest,
		oldest: (a, b) => -newest(a, b),
		finish: (a, b) => (finishOf(a) ?? Infinity) - (finishOf(b) ?? Infinity) || newest(a, b),
		points: (a, b) => (b.points ?? 0) - (a.points ?? 0) || newest(a, b)
	};

	function visible(list: PlayerTournamentEntry[]) {
		return list.filter((t) => status === 'all' || t.status === status).sort(sorters[sort]);
	}

	/** Award grants grouped per award: "Challenger ×2". */
	function awardGroups(p: PlayerProfile, tournament?: string) {
		const groups = new Map<string, number>();
		for (const a of p.awards ?? []) {
			if (tournament && a.tournament?.slug !== tournament) continue;
			groups.set(a.award, (groups.get(a.award) ?? 0) + 1);
		}
		return [...groups].map(([slug, count]) => ({ ...getAwardContent(slug), count }));
	}

	/** Per-tournament summaries, taken from the published match list. */
	function tournamentSummary(p: PlayerProfile, slug: string) {
		const matches = (p.matches ?? []).filter((m) => m.tournament.slug === slug);
		const nemesisGames = matches.filter((m) => m.nemesis);
		return {
			awards: awardGroups(p, slug),
			categories: matches.filter((m) => m.placement === 1).map((m) => m.category),
			nemesisBeaten: nemesisGames.filter((m) => m.defeatedNemesis).length,
			nemesisGames: nemesisGames.length
		};
	}

	function percent(part: number, whole: number) {
		return whole > 0 ? `${Math.round((part / whole) * 100)}%` : '–';
	}
</script>

<PageMeta
	title={player ? player.name : notFound ? 'Player not found' : params.slug}
	description={player
		? `${player.name} on The Ultimate Gamer: titles, tournaments, awards and Nemesis rivalries.`
		: undefined}
/>

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
			{@const awards = awardGroups(p)}
			{@const categoryTotal = (p.categoryWins ?? []).reduce((n, c) => n + c.wins, 0)}
			{@const tournaments = p.tournaments ?? []}
			{@const shown = visible(tournaments)}
			{@const statuses = [...new Set(tournaments.map((t) => t.status))]}
			{@const panelTournament = panel?.tournament
				? tournaments.find((t) => t.tournament.slug === panel!.tournament)
				: null}
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
					{#if p.discord}<div><DiscordLink account={p.discord} /></div>{/if}
					<div class="tags">
						{#if titles > 0}<StatusBadge status="champion" />
							{#if titles > 1}<span class="num times">×{titles}</span>{/if}{/if}
						{#if p.current}
							<span class="current">
								<span class="dot" aria-hidden="true"></span>
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
					<p class="facts subtle">
						{#if p.tournamentsPlayed != null}<span>{plural(p.tournamentsPlayed, 'tournament')}</span
							>{/if}
						{#if p.bestPlacement}<span
								>Best finish <strong class="num">{ordinal(p.bestPlacement)}</strong></span
							>{/if}
						{#if p.challengerAppearances}<span
								><strong class="num">{p.challengerAppearances}×</strong> Challenger</span
							>{/if}
						{#if p.gameWins != null}<span>{plural(p.gameWins, 'game win')}</span>{/if}
						{#if p.firstTournament}<span>Since {p.firstTournament.name}</span>{/if}
					</p>
				</div>
				<div class="head-actions">
					<ShareButton kind="player" slug={p.slug} title="{p.name} · The Ultimate Gamer" />
					<LastUpdated
						generatedAt={resource.generatedAt}
						refreshing={resource.refreshing}
						error={resource.error}
					/>
				</div>
			</header>

			<section class="shelf" aria-label="Trophy cabinet">
				<button class="tile" type="button" onclick={() => openCareer('awards')}>
					<span class="tile-head">
						<span class="eyebrow">Awards</span>
						<span class="chev" aria-hidden="true">›</span>
					</span>
					<span class="big num">{p.awards?.length ?? p.awardCount ?? 0}</span>
					{#if awards.length}
						<span class="icons" aria-hidden="true">
							{#each awards.slice(0, 8) as a (a.slug)}
								<span class="trophy" title={a.name}
									>{a.icon}{#if a.count > 1}<span class="num mult">×{a.count}</span>{/if}</span
								>
							{/each}
						</span>
						<span class="visually-hidden"
							>{awards.map((a) => `${a.name}${a.count > 1 ? ` ×${a.count}` : ''}`).join(', ')}</span
						>
					{:else}
						<span class="subtle small">No awards yet</span>
					{/if}
				</button>

				<button class="tile" type="button" onclick={() => openCareer('categories')}>
					<span class="tile-head">
						<span class="eyebrow">Category wins</span>
						<span class="chev" aria-hidden="true">›</span>
					</span>
					<span class="big num">{categoryTotal}</span>
					{#if p.categoryWins?.length}
						<span class="icons">
							{#each p.categoryWins.slice(0, 8) as c (c.category)}
								<span class="cat"
									><CategoryBadge slug={c.category} iconOnly size="sm" />{#if c.wins > 1}<span
											class="num mult">×{c.wins}</span
										>{/if}</span
								>
							{/each}
						</span>
					{:else}
						<span class="subtle small">No games won yet</span>
					{/if}
				</button>

				<button class="tile" type="button" onclick={() => openCareer('nemeses')}>
					<span class="tile-head">
						<span class="eyebrow">Nemeses</span>
						<span class="chev" aria-hidden="true">›</span>
					</span>
					{#if p.nemesis}
						<span class="big num"
							><span class="w">{p.nemesis.defeated}</span><span class="sep">–</span><span class="l"
								>{p.nemesis.defeatedBy}</span
							></span
						>
						<span class="subtle small">
							{#if p.nemesis.timesAssigned}
								Beat their Nemesis in <strong class="num"
									>{percent(p.nemesis.defeated, p.nemesis.timesAssigned)}</strong
								>
								of games
							{:else}
								Nemeses beaten – times beaten as a Nemesis
							{/if}
						</span>
					{:else}
						<span class="big num">–</span>
						<span class="subtle small">No Nemesis games yet</span>
					{/if}
				</button>
			</section>

			<section class="panel" aria-labelledby="tour-title">
				<div class="panel-header tour-head">
					<h2 class="panel-title" id="tour-title">Tournaments</h2>
					{#if tournaments.length}
						<div class="controls">
							{#if statuses.length > 1}
								<FilterSelect
									inline
									label="Show"
									bind:value={status}
									options={[
										{ value: 'all', label: 'All' },
										...(['ongoing', 'upcoming', 'completed'] as const)
											.filter((s) => statuses.includes(s))
											.map((s) => ({
												value: s,
												label: { ongoing: 'Live', upcoming: 'Upcoming', completed: 'Completed' }[s]
											}))
									]}
								/>
							{/if}
							<FilterSelect inline label="Sort" bind:value={sort} options={sortOptions} />
							<ViewSwitch bind:value={view} />
						</div>
					{/if}
				</div>

				{#if !tournaments.length}
					<div class="panel-body"><p class="subtle">No tournaments recorded.</p></div>
				{:else if !shown.length}
					<div class="panel-body">
						<EmptyState title="No matching tournaments" message="Try another filter." />
					</div>
				{:else if view === 'cards'}
					<ul class="panel-body t-cards">
						{#each shown as t (t.tournament.slug)}
							{@const sum = tournamentSummary(p, t.tournament.slug)}
							{@const finish = finishOf(t)}
							<li class="t-card" class:won={t.wasChampion}>
								<div class="t-top">
									<div class="t-id">
										<h3>
											<a href={resolve('/tournaments/[slug]', { slug: t.tournament.slug })}
												>{t.tournament.name}</a
											>
										</h3>
										<span class="t-meta">
											<StatusPill status={t.status} />
											{#if t.startDate}<span class="subtle">{formatDate(t.startDate)}</span>{/if}
										</span>
									</div>
									<div class="place" class:gold={finish === 1 && t.status === 'completed'}>
										<span class="num">{finish ? ordinal(finish) : '–'}</span>
										<span class="subtle">{t.status === 'ongoing' ? 'live' : 'place'}</span>
									</div>
								</div>
								<div class="t-badges">
									{#if t.wasChampion}<StatusBadge status="champion" size="sm" />
									{:else if t.wasChallenger}<StatusBadge status="challenger" size="sm" />{/if}
								</div>
								<dl class="t-stats">
									<div>
										<dt>Points</dt>
										<dd class="num">{t.points ?? '–'}</dd>
									</div>
									<div>
										<dt>Wins</dt>
										<dd class="num">{t.gamesWon ?? '–'}</dd>
									</div>
									<div>
										<dt>Podiums</dt>
										<dd class="num">{t.podiums ?? '–'}</dd>
									</div>
								</dl>
								<div class="chips">
									<button
										class="chip"
										type="button"
										onclick={() => openTournament(t.tournament.slug, 'awards')}
									>
										<span class="chip-label">Awards</span>
										<span class="chip-value">
											{#each sum.awards.slice(0, 4) as a (a.slug)}<span aria-hidden="true"
													>{a.icon}</span
												>{/each}
											<span class="num">{sum.awards.reduce((n, a) => n + a.count, 0)}</span>
										</span>
									</button>
									<button
										class="chip"
										type="button"
										onclick={() => openTournament(t.tournament.slug, 'categories')}
									>
										<span class="chip-label">Categories</span>
										<span class="chip-value">
											{#each sum.categories.slice(0, 3) as c, i (`${c}-${i}`)}<CategoryBadge
													slug={c}
													iconOnly
													size="sm"
												/>{/each}
											<span class="num">{sum.categories.length}</span>
										</span>
									</button>
									<button
										class="chip"
										type="button"
										onclick={() => openTournament(t.tournament.slug, 'nemeses')}
									>
										<span class="chip-label">Nemesis</span>
										<span class="chip-value num"
											>{sum.nemesisGames ? `${sum.nemesisBeaten}/${sum.nemesisGames}` : '–'}</span
										>
									</button>
								</div>
								<button
									class="open"
									type="button"
									onclick={() => openTournament(t.tournament.slug, 'games')}
								>
									Games <span aria-hidden="true">›</span>
									<span class="visually-hidden">in {t.tournament.name}</span>
								</button>
							</li>
						{/each}
					</ul>
				{:else}
					{@const maxPts = Math.max(1, ...tournaments.map((t) => t.points ?? 0))}
					<div class="table-scroll">
						<table class="data-table history">
							<caption class="visually-hidden"
								>Tournaments played by {p.name}. Open a summary for details.</caption
							>
							<thead>
								<tr>
									<th scope="col">Tournament</th>
									<th scope="col" title="Final placement; the champion counts as 1st">Place</th>
									<th scope="col">Points</th>
									<th scope="col">Wins</th>
									<th scope="col">Podiums</th>
									<th scope="col">Awards</th>
									<th scope="col">Categories</th>
									<th scope="col" title="Nemeses beaten / games with a Nemesis">Nemesis</th>
									<th scope="col"><span class="visually-hidden">Games</span></th>
								</tr>
							</thead>
							<tbody>
								{#each shown as t (t.tournament.slug)}
									{@const sum = tournamentSummary(p, t.tournament.slug)}
									{@const finish = finishOf(t)}
									<tr>
										<th scope="row">
											<a href={resolve('/tournaments/[slug]', { slug: t.tournament.slug })}
												>{t.tournament.name}</a
											>
											{#if t.startDate}<span class="subtle date">{formatDate(t.startDate)}</span
												>{/if}
										</th>
										<td class="num place">
											{finish ? ordinal(finish) : '–'}
											{#if t.status === 'ongoing'}<span class="subtle live">live</span>{/if}
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
											<button
												class="cell-btn"
												type="button"
												onclick={() => openTournament(t.tournament.slug, 'awards')}
											>
												{#each sum.awards.slice(0, 4) as a (a.slug)}<span
														aria-hidden="true"
														title={a.name}>{a.icon}</span
													>{/each}
												<span class="num">{sum.awards.reduce((n, a) => n + a.count, 0)}</span>
												<span class="visually-hidden">awards in {t.tournament.name}</span>
											</button>
										</td>
										<td>
											<button
												class="cell-btn"
												type="button"
												onclick={() => openTournament(t.tournament.slug, 'categories')}
											>
												{#each sum.categories.slice(0, 4) as c, i (`${c}-${i}`)}<CategoryBadge
														slug={c}
														iconOnly
														size="sm"
													/>{/each}
												<span class="num">{sum.categories.length}</span>
												<span class="visually-hidden">category wins in {t.tournament.name}</span>
											</button>
										</td>
										<td>
											<button
												class="cell-btn"
												type="button"
												onclick={() => openTournament(t.tournament.slug, 'nemeses')}
											>
												<span class="num"
													>{sum.nemesisGames
														? `${sum.nemesisBeaten}/${sum.nemesisGames}`
														: '–'}</span
												>
												<span class="visually-hidden">Nemesis games in {t.tournament.name}</span>
											</button>
										</td>
										<td class="open-cell">
											<button
												class="open"
												type="button"
												onclick={() => openTournament(t.tournament.slug, 'games')}
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
				{/if}
			</section>

			<SidePanel
				open={!!panel}
				eyebrow={panelTournament ? `${p.name} · tournament` : `${p.name} · career`}
				title={panelTournament
					? panelTournament.tournament.name
					: panel?.topic === 'awards'
						? 'Awards'
						: panel?.topic === 'categories'
							? 'Category wins'
							: 'Nemeses'}
				onclose={() => (panel = null)}
			>
				{#if panel && panelTournament}
					{@const slug = panelTournament.tournament.slug}
					<div class="panel-tabs">
						<Tabs
							label="Tournament details"
							bind:selected={panelTab}
							tabs={[
								{ id: 'games', label: 'Games' },
								{ id: 'awards', label: 'Awards' },
								{ id: 'categories', label: 'Categories' },
								{ id: 'nemeses', label: 'Nemeses' }
							]}
						>
							{#snippet children(tab)}
								<div class="tab-body">
									{#if tab === 'games'}
										<PlayerMatches player={p} tournament={panelTournament.tournament} />
									{:else if tab === 'awards'}
										<PlayerAwardsDetail player={p} tournament={slug} />
									{:else if tab === 'categories'}
										<PlayerCategoriesDetail player={p} tournament={slug} />
									{:else}
										<PlayerNemesesDetail player={p} tournament={slug} />
									{/if}
								</div>
							{/snippet}
						</Tabs>
					</div>
					<a class="btn" href={resolve('/tournaments/[slug]', { slug })}
						>Open {panelTournament.tournament.name} <span aria-hidden="true">→</span></a
					>
				{:else if panel?.topic === 'awards'}
					<PlayerAwardsDetail player={p} />
				{:else if panel?.topic === 'categories'}
					<PlayerCategoriesDetail player={p} />
				{:else if panel}
					<PlayerNemesesDetail player={p} />
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
		display: inline-flex;
		flex-wrap: wrap;
		align-items: baseline;
		gap: 0.3em;
		color: var(--c-text-muted);
	}

	.dot {
		align-self: center;
		width: 0.45rem;
		height: 0.45rem;
		border-radius: 50%;
		background: var(--c-live);
		box-shadow: 0 0 8px var(--c-live);
	}

	.facts {
		display: flex;
		flex-wrap: wrap;
		gap: var(--sp-1) var(--sp-4);
		font-size: var(--fs-sm);
	}

	.facts strong {
		color: var(--c-text);
	}

	.head-actions {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: var(--sp-3);
	}

	/* Trophy cabinet */
	.shelf {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: var(--sp-4);
	}

	.tile {
		display: grid;
		align-content: start;
		gap: var(--sp-2);
		padding: var(--sp-4) var(--sp-5);
		background: linear-gradient(160deg, rgb(255 198 26 / 0.06), transparent 55%), var(--c-surface);
		border: var(--border);
		border-radius: var(--radius-lg);
		text-align: left;
		cursor: pointer;
		transition:
			border-color var(--t-base),
			transform var(--t-base) var(--ease-out);
	}

	.tile:hover {
		border-color: var(--c-gold-line);
		transform: translateY(-2px);
	}

	.tile-head {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.chev {
		color: var(--c-gold);
		font-size: var(--fs-lg);
	}

	.big {
		font-size: var(--fs-3xl);
		font-weight: 700;
		line-height: 1;
		color: var(--c-gold-bright);
	}

	.big .w {
		color: var(--c-live);
	}

	.big .l {
		color: var(--c-challenger);
	}

	.big .sep {
		color: var(--c-text-subtle);
		margin-inline: 0.1em;
	}

	.icons {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: var(--sp-2);
	}

	.trophy {
		display: inline-flex;
		align-items: baseline;
		gap: 0.1rem;
		font-size: 1.35rem;
	}

	.cat {
		display: inline-flex;
		align-items: center;
		gap: 0.15rem;
	}

	.mult {
		font-size: var(--fs-xs);
		color: var(--c-text-muted);
	}

	.small {
		font-size: var(--fs-xs);
	}

	/* Tournaments */
	.tour-head {
		flex-wrap: wrap;
		gap: var(--sp-3);
	}

	.controls {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: var(--sp-3);
	}

	.t-cards {
		list-style: none;
		margin: 0;
		display: grid;
		gap: var(--sp-4);
		grid-template-columns: repeat(auto-fill, minmax(min(100%, 19rem), 1fr));
	}

	.t-card {
		display: grid;
		align-content: start;
		gap: var(--sp-3);
		padding: var(--sp-4);
		background: var(--c-bg-raised);
		border: var(--border);
		border-radius: var(--radius-lg);
	}

	.t-card.won {
		border-color: var(--c-gold-line);
		background:
			linear-gradient(160deg, rgb(255 198 26 / 0.08), transparent 55%), var(--c-bg-raised);
	}

	.t-top {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		gap: var(--sp-3);
	}

	.t-id {
		display: grid;
		gap: var(--sp-1);
		min-width: 0;
	}

	h3 {
		font-size: var(--fs-lg);
		text-transform: uppercase;
	}

	h3 a {
		text-decoration: none;
	}

	.t-meta {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: var(--sp-2);
		font-size: var(--fs-xs);
	}

	.place {
		display: grid;
		justify-items: end;
		line-height: 1.1;
	}

	.place .num {
		font-size: var(--fs-2xl);
		font-weight: 700;
	}

	.place .subtle {
		font-size: 0.65rem;
		text-transform: uppercase;
		letter-spacing: var(--tracking-wide);
	}

	.place.gold .num {
		color: var(--c-gold-bright);
	}

	.t-badges:empty {
		display: none;
	}

	.t-stats {
		margin: 0;
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: var(--sp-2);
	}

	.t-stats div {
		display: grid;
	}

	dt {
		font-size: 0.62rem;
		text-transform: uppercase;
		letter-spacing: 0.04em;
		color: var(--c-text-subtle);
	}

	dd {
		margin: 0;
		font-weight: 700;
	}

	.chips {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: var(--sp-2);
	}

	.chip {
		display: grid;
		gap: 0.15rem;
		padding: var(--sp-2);
		background: var(--c-surface);
		border: var(--border);
		border-radius: var(--radius-md);
		text-align: left;
		cursor: pointer;
	}

	.chip:hover {
		border-color: var(--c-gold-line);
	}

	.chip-label {
		font-size: 0.62rem;
		text-transform: uppercase;
		letter-spacing: 0.04em;
		color: var(--c-text-subtle);
	}

	.chip-value {
		display: flex;
		align-items: center;
		gap: 0.2rem;
		font-weight: 700;
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

	.data-table .place {
		display: table-cell;
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

	.cell-btn {
		display: inline-flex;
		align-items: center;
		gap: 0.25rem;
		padding: 0.2rem 0.45rem;
		background: none;
		border: 1px dashed var(--c-border-strong);
		border-radius: var(--radius-sm);
		white-space: nowrap;
		cursor: pointer;
	}

	.cell-btn:hover {
		border-color: var(--c-gold-line);
		color: var(--c-gold-bright);
	}

	.open-cell {
		text-align: right;
	}

	.open {
		justify-self: start;
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

	/* Side panel */
	.panel-tabs {
		margin-inline: calc(-1 * var(--sp-5));
	}

	.tab-body {
		padding: var(--sp-5) var(--sp-5) 0;
	}

	.btn {
		justify-self: start;
	}

	@media (max-width: 760px) {
		.shelf {
			grid-template-columns: minmax(0, 1fr);
		}
	}
</style>
