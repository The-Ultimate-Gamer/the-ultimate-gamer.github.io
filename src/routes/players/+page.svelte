<script lang="ts">
	import PageMeta from '#lib/components/PageMeta.svelte';
	import { resolve } from '$app/paths';
	import { getPlayers } from '#lib/data/client.ts';
	import { useResource } from '#lib/data/resource.svelte.ts';
	import DataView from '#lib/components/DataView.svelte';
	import PageTitle from '#lib/components/PageTitle.svelte';
	import PlayerAvatar from '#lib/components/PlayerAvatar.svelte';
	import LastUpdated from '#lib/components/LastUpdated.svelte';
	import { ordinal } from '#lib/format.ts';
	import EmptyState from '#lib/components/EmptyState.svelte';
	import FilterLayout from '#lib/components/FilterLayout.svelte';
	import FilterOptions from '#lib/components/FilterOptions.svelte';
	import FilterSelect from '#lib/components/FilterSelect.svelte';
	import ResultsToolbar from '#lib/components/ResultsToolbar.svelte';
	import type { ViewMode } from '#lib/components/ViewSwitch.svelte';
	import type { PlayerSummary } from '#lib/data/types.ts';

	const resource = useResource(getPlayers);

	type Group = 'all' | 'champions' | 'challengers' | 'live';
	type Sort =
		'titles' | 'wins' | 'podiums' | 'challenger' | 'awards' | 'tournaments' | 'best' | 'name';

	let group = $state<Group>('all');
	let since = $state('all');
	let sort = $state<Sort>('titles');
	let view = $state<ViewMode>('cards');

	const groupOptions: { value: Group; label: string; test: (p: PlayerSummary) => boolean }[] = [
		{ value: 'all', label: 'All players', test: () => true },
		{ value: 'champions', label: 'Ultimate Gamers', test: (p) => (p.ultimateGamerWins ?? 0) > 0 },
		{
			value: 'challengers',
			label: 'Reached Challenger',
			test: (p) => (p.challengerAppearances ?? 0) > 0
		},
		{ value: 'live', label: 'Playing now', test: (p) => !!p.current }
	];

	const byName = (a: PlayerSummary, b: PlayerSummary) => a.name.localeCompare(b.name);
	const desc = (key: keyof PlayerSummary) => (a: PlayerSummary, b: PlayerSummary) =>
		Number(b[key] ?? 0) - Number(a[key] ?? 0);
	const sortOptions: {
		value: Sort;
		label: string;
		compare: (a: PlayerSummary, b: PlayerSummary) => number;
	}[] = [
		{
			value: 'titles',
			label: 'Titles',
			compare: (a, b) => desc('ultimateGamerWins')(a, b) || desc('gameWins')(a, b) || byName(a, b)
		},
		{
			value: 'wins',
			label: 'Game wins',
			compare: (a, b) => desc('gameWins')(a, b) || byName(a, b)
		},
		{
			value: 'podiums',
			label: 'Podiums',
			compare: (a, b) => desc('podiumFinishes')(a, b) || byName(a, b)
		},
		{
			value: 'challenger',
			label: 'Challenger',
			compare: (a, b) => desc('challengerAppearances')(a, b) || byName(a, b)
		},
		{
			value: 'awards',
			label: 'Awards',
			compare: (a, b) => desc('awardCount')(a, b) || byName(a, b)
		},
		{
			value: 'tournaments',
			label: 'Tournaments played',
			compare: (a, b) => desc('tournamentsPlayed')(a, b) || byName(a, b)
		},
		{
			value: 'best',
			label: 'Best finish',
			compare: (a, b) =>
				(a.bestPlacement ?? Infinity) - (b.bestPlacement ?? Infinity) || byName(a, b)
		},
		{ value: 'name', label: 'Name', compare: byName }
	];

	const activeFilters = $derived((group !== 'all' ? 1 : 0) + (since !== 'all' ? 1 : 0));

	function visible(list: PlayerSummary[]) {
		const test = groupOptions.find((g) => g.value === group)!.test;
		const compare = sortOptions.find((o) => o.value === sort)!.compare;
		return list
			.filter((p) => test(p) && (since === 'all' || p.firstTournament?.slug === since))
			.sort(compare);
	}

	/** Debut tournaments, newest first as listed. */
	function debuts(list: PlayerSummary[]) {
		const seen = new Map<string, { value: string; label: string; count: number }>();
		for (const p of list) {
			if (!p.firstTournament) continue;
			const entry = seen.get(p.firstTournament.slug) ?? {
				value: p.firstTournament.slug,
				label: p.firstTournament.name,
				count: 0
			};
			entry.count++;
			seen.set(p.firstTournament.slug, entry);
		}
		return [...seen.values()];
	}

	function reset() {
		group = 'all';
		since = 'all';
	}
</script>

<PageMeta
	title="Players"
	description="Everyone who has competed in The Ultimate Gamer, with titles, awards and all-time records."
/>

<div class="container page">
	<PageTitle
		eyebrow="Roster"
		title="Players"
		lead="Everyone who has competed for the crown, with their all-time records."
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
		isEmpty={(d) => d.players.length === 0}
		emptyTitle="No players yet"
		emptyMessage="No players have been published yet."
	>
		{#snippet children({ players })}
			{@const shown = visible(players)}
			{@const debutList = debuts(players)}
			<FilterLayout active={activeFilters} onreset={reset}>
				{#snippet filters()}
					<FilterOptions
						legend="Show"
						name="group"
						bind:value={group}
						options={groupOptions.map((g) => ({
							value: g.value,
							label: g.label,
							count: players.filter(g.test).length
						}))}
					/>
					{#if debutList.length > 1}
						<FilterOptions
							legend="Debut"
							name="since"
							bind:value={since}
							options={[{ value: 'all', label: 'Any tournament' }, ...debutList]}
						/>
					{/if}
					<FilterSelect
						label="Sort by"
						bind:value={sort}
						options={sortOptions.map((o) => ({ value: o.value, label: o.label }))}
					/>
				{/snippet}

				<ResultsToolbar shown={shown.length} total={players.length} noun="players" bind:view />

				{#if !shown.length}
					<EmptyState
						title="No matching players"
						message="No players match these filters. Try clearing them."
					/>
				{:else if view === 'cards'}
					<ul class="players">
						{#each shown as p (p.slug)}
							{@const titles = p.ultimateGamerWins ?? 0}
							<li class="card" class:champ={titles > 0}>
								<div class="top">
									<PlayerAvatar
										name={p.name}
										initials={p.initials}
										avatarUrl={p.avatarUrl}
										size="lg"
										highlight={titles > 0 ? 'champion' : null}
									/>
									<div class="id">
										<h2><a href={resolve('/players/[slug]', { slug: p.slug })}>{p.name}</a></h2>
										{#if titles > 0}
											<p class="titles">
												<span aria-hidden="true">{'👑'.repeat(Math.min(titles, 5))}</span>
												{titles}× Ultimate Gamer
											</p>
										{/if}
										{#if p.firstTournament}
											<p class="subtle since">Since {p.firstTournament.name}</p>
										{/if}
									</div>
								</div>
								{#if p.current}
									<p class="live">
										<span class="dot" aria-hidden="true"></span>
										Live: <strong class="num">{ordinal(p.current.rank)}</strong> ·
										<span class="num">{p.current.points}</span> pts in {p.current.tournament.name}
									</p>
								{/if}
								<dl class="mini">
									<div>
										<dt>Played</dt>
										<dd class="num">{p.tournamentsPlayed ?? '–'}</dd>
									</div>
									<div>
										<dt>Game wins</dt>
										<dd class="num">{p.gameWins ?? '–'}</dd>
									</div>
									<div>
										<dt>Podiums</dt>
										<dd class="num">{p.podiumFinishes ?? '–'}</dd>
									</div>
									<div>
										<dt>Challenger</dt>
										<dd class="num">{p.challengerAppearances ?? '–'}</dd>
									</div>
									<div>
										<dt>Awards</dt>
										<dd class="num">{p.awardCount ?? '–'}</dd>
									</div>
									<div>
										<dt>Best finish</dt>
										<dd class="num">{p.bestPlacement ? ordinal(p.bestPlacement) : '–'}</dd>
									</div>
								</dl>
							</li>
						{/each}
					</ul>
				{:else}
					<div class="panel table-scroll">
						<table class="data-table">
							<caption class="visually-hidden"
								>Players, sorted by {sortOptions.find((o) => o.value === sort)?.label}</caption
							>
							<thead>
								<tr>
									<th scope="col">Player</th>
									<th scope="col">Titles</th>
									<th scope="col">Challenger</th>
									<th scope="col">Game wins</th>
									<th scope="col">Podiums</th>
									<th scope="col">Played</th>
									<th scope="col">Awards</th>
									<th scope="col">Best finish</th>
									<th scope="col">Since</th>
									<th scope="col">Live</th>
								</tr>
							</thead>
							<tbody>
								{#each shown as p (p.slug)}
									<tr>
										<th scope="row">
											<a class="player" href={resolve('/players/[slug]', { slug: p.slug })}>
												<PlayerAvatar
													name={p.name}
													initials={p.initials}
													avatarUrl={p.avatarUrl}
													size="sm"
													highlight={(p.ultimateGamerWins ?? 0) > 0 ? 'champion' : null}
												/>
												{p.name}
											</a>
										</th>
										<td class="num titles-cell">{p.ultimateGamerWins ?? '–'}</td>
										<td class="num">{p.challengerAppearances ?? '–'}</td>
										<td class="num">{p.gameWins ?? '–'}</td>
										<td class="num">{p.podiumFinishes ?? '–'}</td>
										<td class="num">{p.tournamentsPlayed ?? '–'}</td>
										<td class="num">{p.awardCount ?? '–'}</td>
										<td class="num">{p.bestPlacement ? ordinal(p.bestPlacement) : '–'}</td>
										<td class="nowrap">{p.firstTournament?.name ?? '–'}</td>
										<td class="nowrap">
											{#if p.current}
												<span class="num">{ordinal(p.current.rank)}</span>
												<span class="subtle num">· {p.current.points} pts</span>
											{:else}<span class="subtle">–</span>{/if}
										</td>
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
	.players {
		list-style: none;
		margin: 0;
		padding: 0;
		display: grid;
		gap: var(--sp-4);
		grid-template-columns: repeat(auto-fill, minmax(min(100%, 17rem), 1fr));
	}

	.card {
		position: relative;
		display: grid;
		gap: var(--sp-4);
		padding: var(--sp-4) var(--sp-5);
		background: var(--c-surface);
		border: var(--border);
		border-radius: var(--radius-lg);
		cursor: pointer;
		transition:
			border-color var(--t-base),
			transform var(--t-base) var(--ease-out);
	}

	.card:hover,
	.card:focus-within {
		border-color: var(--c-gold-line);
		transform: translateY(-2px);
	}

	.champ {
		background: linear-gradient(160deg, rgb(255 198 26 / 0.07), transparent 50%), var(--c-surface);
	}

	.top {
		display: flex;
		align-items: center;
		gap: var(--sp-3);
	}

	.id {
		flex: 1;
		min-width: 0;
	}

	h2 {
		font-size: var(--fs-xl);
		text-transform: uppercase;
		overflow-wrap: anywhere;
	}

	h2 a {
		text-decoration: none;
	}

	/* Make the whole card clickable while keeping a single link in the tab order. */
	h2 a::after {
		content: '';
		position: absolute;
		inset: 0;
		z-index: 1;
		border-radius: inherit;
	}

	.titles {
		font-size: var(--fs-xs);
		color: var(--c-gold);
		font-weight: 600;
	}

	.since {
		font-size: var(--fs-xs);
	}

	.mini {
		margin: 0;
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: var(--sp-3) var(--sp-2);
		border-top: var(--border);
		padding-top: var(--sp-3);
	}

	.mini div {
		display: grid;
		align-content: start;
		gap: 0.1rem;
		min-width: 0;
	}

	dt {
		font-size: 0.62rem;
		line-height: 1.2;
		text-transform: uppercase;
		letter-spacing: 0.04em;
		color: var(--c-text-subtle);
	}

	dd {
		margin: 0;
		font-weight: 700;
	}

	.player {
		display: inline-flex;
		align-items: center;
		gap: var(--sp-2);
		font-weight: 600;
		text-decoration: none;
	}

	.live {
		display: flex;
		align-items: center;
		gap: var(--sp-2);
		font-size: var(--fs-xs);
		color: var(--c-text-muted);
	}

	.dot {
		width: 0.45rem;
		height: 0.45rem;
		border-radius: 50%;
		background: var(--c-live);
		box-shadow: 0 0 8px var(--c-live);
	}

	.nowrap {
		white-space: nowrap;
	}

	.titles-cell {
		color: var(--c-gold-bright);
		font-weight: 700;
	}
</style>
