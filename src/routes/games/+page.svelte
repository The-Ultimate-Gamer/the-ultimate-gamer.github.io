<script lang="ts">
	import PageMeta from '#lib/components/PageMeta.svelte';
	import { resolve } from '$app/paths';
	import { getCategories, getGames } from '#lib/data/client.ts';
	import { useResource } from '#lib/data/resource.svelte.ts';
	import DataView from '#lib/components/DataView.svelte';
	import PageTitle from '#lib/components/PageTitle.svelte';
	import CategoryBadge from '#lib/components/CategoryBadge.svelte';
	import EmptyState from '#lib/components/EmptyState.svelte';
	import LastUpdated from '#lib/components/LastUpdated.svelte';
	import { getCategoryContent } from '#lib/content/categories.ts';
	import { formatDate } from '#lib/format.ts';
	import type { GameInfo } from '#lib/data/types.ts';

	const games = useResource(getGames);
	const categories = useResource(getCategories);

	type Status = 'all' | 'played' | 'never' | 'available' | 'retired';
	type Sort = 'name' | 'played' | 'last' | 'nominated' | 'players';

	let category = $state('all');
	let status = $state<Status>('all');
	let sort = $state<Sort>('name');
	let view = $state<'cards' | 'table'>('cards');
	let filtersOpen = $state(false);

	const statusOptions: { id: Status; label: string }[] = [
		{ id: 'all', label: 'All games' },
		{ id: 'played', label: 'Played' },
		{ id: 'never', label: 'Never played' },
		{ id: 'available', label: 'Available' },
		{ id: 'retired', label: 'Not in rotation' }
	];

	const sortOptions: { id: Sort; label: string }[] = [
		{ id: 'name', label: 'Name' },
		{ id: 'played', label: 'Times played' },
		{ id: 'last', label: 'Last played' },
		{ id: 'nominated', label: 'Times nominated' },
		{ id: 'players', label: 'Player count' }
	];

	/** Categories used by tournaments first; the rest work as tags (Idle, Speedrun…). */
	const categoryGroups = $derived.by(() => {
		const list = categories.data
			? categories.data.categories.map((c) => ({
					slug: c.slug,
					name: c.name,
					used: c.tournamentsUsed
				}))
			: [...new Set((games.data?.games ?? []).flatMap((g) => g.categories))].map((slug) => ({
					slug,
					name: getCategoryContent(slug).name,
					used: undefined as number | undefined
				}));
		// Without usage data, everything counts as a category.
		return {
			tournament: list.filter((c) => c.used === undefined || c.used > 0),
			tags: list.filter((c) => c.used === 0)
		};
	});

	const activeFilters = $derived((category !== 'all' ? 1 : 0) + (status !== 'all' ? 1 : 0));

	function matchesStatus(g: GameInfo): boolean {
		switch (status) {
			case 'played':
				return (g.timesPlayed ?? 0) > 0;
			case 'never':
				return !g.timesPlayed;
			case 'available':
				return g.available === true;
			case 'retired':
				return g.available === false;
			default:
				return true;
		}
	}

	const byName = (a: GameInfo, b: GameInfo) => a.name.localeCompare(b.name);
	const sorters: Record<Sort, (a: GameInfo, b: GameInfo) => number> = {
		name: byName,
		played: (a, b) => (b.timesPlayed ?? 0) - (a.timesPlayed ?? 0) || byName(a, b),
		nominated: (a, b) => (b.timesNominated ?? 0) - (a.timesNominated ?? 0) || byName(a, b),
		last: (a, b) =>
			(b.lastPlayed?.playedAt ?? '').localeCompare(a.lastPlayed?.playedAt ?? '') || byName(a, b),
		players: (a, b) =>
			(b.maxPlayers ?? b.minPlayers ?? -1) - (a.maxPlayers ?? a.minPlayers ?? -1) || byName(a, b)
	};

	function visible(list: GameInfo[]) {
		return list
			.filter((g) => (category === 'all' || g.categories.includes(category)) && matchesStatus(g))
			.sort(sorters[sort]);
	}

	function countFor(list: GameInfo[], slug: string) {
		return list.filter((g) => g.categories.includes(slug)).length;
	}

	function playerCount(g: GameInfo): string {
		if (!g.minPlayers && !g.maxPlayers) return '–';
		if (g.minPlayers && g.maxPlayers && g.minPlayers !== g.maxPlayers)
			return `${g.minPlayers}–${g.maxPlayers}`;
		return String(g.minPlayers ?? g.maxPlayers);
	}

	function reset() {
		category = 'all';
		status = 'all';
	}
</script>

<PageMeta
	title="Games & categories"
	description="Browse the games of The Ultimate Gamer by category: played, available and never-picked titles."
/>

<div class="container page">
	<PageTitle
		eyebrow="Library"
		title="Games & categories"
		lead="Every game that has been played, nominated or is waiting for its moment."
	>
		{#snippet actions()}
			{#if games.status === 'success'}
				<LastUpdated
					generatedAt={games.generatedAt}
					refreshing={games.refreshing}
					error={games.error}
				/>
			{/if}
		{/snippet}
	</PageTitle>

	<DataView
		resource={games}
		isEmpty={(d) => d.games.length === 0}
		emptyTitle="No games yet"
		emptyMessage="The game library has not been published yet."
	>
		{#snippet children({ games: list })}
			{@const shown = visible(list)}
			<div class="library">
				<aside class="panel filters" aria-label="Filters">
					<button
						class="filters-toggle"
						type="button"
						aria-expanded={filtersOpen}
						aria-controls="filter-body"
						onclick={() => (filtersOpen = !filtersOpen)}
					>
						Filters & sorting
						{#if activeFilters}<span class="badge num">{activeFilters}</span>{/if}
						<span class="chev" aria-hidden="true">{filtersOpen ? '▴' : '▾'}</span>
					</button>

					<div id="filter-body" class="filter-body" class:open={filtersOpen}>
						<fieldset>
							<legend>Category</legend>
							<label class="option">
								<input type="radio" name="category" value="all" bind:group={category} />
								<span>All categories</span>
								<span class="num count">{list.length}</span>
							</label>
							{#each categoryGroups.tournament as c (c.slug)}
								<label class="option">
									<input type="radio" name="category" value={c.slug} bind:group={category} />
									<span
										><span aria-hidden="true">{getCategoryContent(c.slug).icon}</span>
										{c.name}</span
									>
									<span class="num count">{countFor(list, c.slug)}</span>
								</label>
							{/each}
						</fieldset>

						{#if categoryGroups.tags.length}
							<fieldset>
								<legend>Tags <span class="hint">· not used by a tournament yet</span></legend>
								{#each categoryGroups.tags as c (c.slug)}
									<label class="option">
										<input type="radio" name="category" value={c.slug} bind:group={category} />
										<span
											><span aria-hidden="true">{getCategoryContent(c.slug).icon}</span>
											{c.name}</span
										>
										<span class="num count">{countFor(list, c.slug)}</span>
									</label>
								{/each}
							</fieldset>
						{/if}

						<fieldset>
							<legend>Status</legend>
							{#each statusOptions as o (o.id)}
								<label class="option">
									<input type="radio" name="status" value={o.id} bind:group={status} />
									<span>{o.label}</span>
								</label>
							{/each}
						</fieldset>

						<label class="sort">
							<span class="legend-like">Sort by</span>
							<select bind:value={sort}>
								{#each sortOptions as o (o.id)}<option value={o.id}>{o.label}</option>{/each}
							</select>
						</label>

						{#if activeFilters}
							<button class="btn reset" type="button" onclick={reset}>Clear filters</button>
						{/if}
					</div>
				</aside>

				<div class="results">
					<div class="toolbar">
						<p class="subtle" aria-live="polite">
							<span class="num">{shown.length}</span> of <span class="num">{list.length}</span> games
						</p>
						<div class="view-switch" role="group" aria-label="View">
							<button type="button" aria-pressed={view === 'cards'} onclick={() => (view = 'cards')}
								>Cards</button
							>
							<button type="button" aria-pressed={view === 'table'} onclick={() => (view = 'table')}
								>Table</button
							>
						</div>
					</div>

					{#if category !== 'all'}
						{@const desc =
							categories.data?.categories.find((c) => c.slug === category)?.description ||
							getCategoryContent(category).blurb}
						{#if desc}<p class="cat-desc muted">{desc}</p>{/if}
					{/if}

					{#if !shown.length}
						<EmptyState
							title="No matching games"
							message="No games match these filters. Try clearing them."
						/>
					{:else if view === 'cards'}
						<ul class="games">
							{#each shown as g (g.slug)}
								<li class="game" class:unplayed={!g.timesPlayed}>
									<div class="cats">
										{#each g.categories as c (c)}<CategoryBadge slug={c} size="sm" />{/each}
									</div>
									<h2>{g.name}</h2>
									{#if g.description}<p class="muted desc">{g.description}</p>{/if}
									<dl class="facts">
										<div>
											<dt>Players</dt>
											<dd class="num">{playerCount(g)}</dd>
										</div>
										<div>
											<dt>Played</dt>
											<dd class="num">{g.timesPlayed ?? 0}×</dd>
										</div>
										<div>
											<dt>Nominated</dt>
											<dd class="num">{g.timesNominated != null ? `${g.timesNominated}×` : '–'}</dd>
										</div>
									</dl>
									<p class="foot">
										{#if g.lastPlayed}
											<span class="subtle">
												Last played in
												<a
													href="{resolve('/tournaments/[slug]', {
														slug: g.lastPlayed.tournament.slug
													})}#game-{g.lastPlayed.gameNumber}">{g.lastPlayed.tournament.name}</a
												>
											</span>
										{:else}
											<span class="tag never">Never played</span>
										{/if}
										{#if g.available === false}
											<span class="tag off">Not in rotation</span>
										{:else if g.available}
											<span class="tag on">Available</span>
										{/if}
									</p>
								</li>
							{/each}
						</ul>
					{:else}
						<div class="panel table-scroll">
							<table class="data-table">
								<caption class="visually-hidden"
									>Games, {sortOptions.find((o) => o.id === sort)?.label}</caption
								>
								<thead>
									<tr>
										<th scope="col">Game</th>
										<th scope="col">Categories</th>
										<th scope="col">Players</th>
										<th scope="col">Played</th>
										<th scope="col">Nominated</th>
										<th scope="col">Last played</th>
										<th scope="col">Status</th>
									</tr>
								</thead>
								<tbody>
									{#each shown as g (g.slug)}
										<tr>
											<th scope="row">{g.name}</th>
											<td>
												<span class="cats">
													{#each g.categories as c (c)}<CategoryBadge
															slug={c}
															size="sm"
															iconOnly
														/>{/each}
												</span>
											</td>
											<td class="num">{playerCount(g)}</td>
											<td class="num">{g.timesPlayed ?? 0}</td>
											<td class="num">{g.timesNominated ?? '–'}</td>
											<td>
												{#if g.lastPlayed}
													<a
														href="{resolve('/tournaments/[slug]', {
															slug: g.lastPlayed.tournament.slug
														})}#game-{g.lastPlayed.gameNumber}"
														>{g.lastPlayed.playedAt
															? formatDate(g.lastPlayed.playedAt)
															: g.lastPlayed.tournament.name}</a
													>
												{:else}<span class="subtle">Never</span>{/if}
											</td>
											<td>
												{#if g.available === false}<span class="tag off">Not in rotation</span>
												{:else if g.available}<span class="tag on">Available</span>
												{:else}<span class="subtle">–</span>{/if}
											</td>
										</tr>
									{/each}
								</tbody>
							</table>
						</div>
					{/if}
				</div>
			</div>
		{/snippet}
	</DataView>
</div>

<style>
	.library {
		display: grid;
		grid-template-columns: 15rem minmax(0, 1fr);
		gap: var(--sp-5);
		align-items: start;
	}

	.filters {
		position: sticky;
		top: 5.5rem;
		max-height: calc(100vh - 7rem);
		overflow-y: auto;
	}

	.filters-toggle {
		display: none;
	}

	.filter-body {
		display: grid;
		gap: var(--sp-4);
		padding: var(--sp-4);
	}

	fieldset {
		margin: 0;
		padding: 0;
		border: 0;
		display: grid;
		gap: 0.15rem;
	}

	legend,
	.legend-like {
		margin-bottom: var(--sp-2);
		font-family: var(--font-display);
		font-size: var(--fs-xs);
		font-weight: 700;
		letter-spacing: var(--tracking-wider);
		text-transform: uppercase;
		color: var(--c-text-subtle);
	}

	.hint {
		text-transform: none;
		letter-spacing: normal;
		font-family: var(--font-sans);
		font-weight: 400;
	}

	.option {
		display: grid;
		grid-template-columns: auto 1fr auto;
		align-items: center;
		gap: var(--sp-2);
		padding: 0.3rem var(--sp-2);
		border-radius: var(--radius-sm);
		font-size: var(--fs-sm);
		cursor: pointer;
	}

	.option:hover {
		background: var(--c-surface-2);
	}

	.option:has(input:checked) {
		background: var(--c-gold-soft);
		color: var(--c-gold-bright);
	}

	.option input {
		accent-color: var(--c-gold);
		margin: 0;
	}

	.count {
		font-size: var(--fs-xs);
		color: var(--c-text-subtle);
	}

	.sort {
		display: grid;
	}

	select {
		padding: 0.45rem 0.6rem;
		background: var(--c-surface-2);
		border: var(--border-strong);
		border-radius: var(--radius-md);
		font: inherit;
		font-size: var(--fs-sm);
		color: var(--c-text);
	}

	.reset {
		justify-self: start;
	}

	.results {
		display: grid;
		gap: var(--sp-4);
		min-width: 0;
	}

	.toolbar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--sp-3);
		font-size: var(--fs-sm);
	}

	.view-switch {
		display: inline-flex;
		border: var(--border-strong);
		border-radius: var(--radius-md);
		overflow: hidden;
	}

	.view-switch button {
		padding: 0.35rem 0.8rem;
		background: none;
		border: 0;
		font-size: var(--fs-xs);
		font-weight: 700;
		letter-spacing: var(--tracking-wide);
		text-transform: uppercase;
		color: var(--c-text-muted);
		cursor: pointer;
	}

	.view-switch button[aria-pressed='true'] {
		background: var(--c-gold);
		color: var(--c-on-gold);
	}

	.cat-desc {
		max-width: 65ch;
	}

	.games {
		list-style: none;
		margin: 0;
		padding: 0;
		display: grid;
		gap: var(--sp-4);
		grid-template-columns: repeat(auto-fill, minmax(min(100%, 17rem), 1fr));
	}

	.game {
		display: grid;
		align-content: start;
		gap: var(--sp-3);
		padding: var(--sp-4) var(--sp-5);
		background: var(--c-surface);
		border: var(--border);
		border-radius: var(--radius-lg);
	}

	.unplayed {
		background: var(--c-bg-raised);
		border-style: dashed;
	}

	.cats {
		display: flex;
		flex-wrap: wrap;
		gap: 0.3rem;
	}

	h2 {
		font-size: var(--fs-xl);
	}

	.desc {
		font-size: var(--fs-sm);
	}

	.facts {
		margin: 0;
		display: flex;
		gap: var(--sp-5);
	}

	.facts div {
		display: grid;
	}

	dt {
		font-size: 0.65rem;
		text-transform: uppercase;
		letter-spacing: var(--tracking-wide);
		color: var(--c-text-subtle);
	}

	dd {
		margin: 0;
		font-weight: 700;
	}

	.foot {
		display: flex;
		flex-wrap: wrap;
		gap: var(--sp-2);
		align-items: center;
		justify-content: space-between;
		font-size: var(--fs-xs);
		border-top: var(--border);
		padding-top: var(--sp-3);
	}

	.data-table a {
		text-decoration: none;
	}

	.tag {
		padding: 0.1rem 0.45rem;
		border-radius: var(--radius-sm);
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		font-size: 0.65rem;
		white-space: nowrap;
	}

	.never {
		background: var(--c-info-soft);
		color: var(--c-info);
	}

	.on {
		background: var(--c-live-soft);
		color: var(--c-live);
	}

	.off {
		background: var(--c-surface-3);
		color: var(--c-text-subtle);
	}

	@media (max-width: 900px) {
		.library {
			grid-template-columns: minmax(0, 1fr);
		}

		.filters {
			position: static;
			max-height: none;
		}

		.filters-toggle {
			display: flex;
			align-items: center;
			gap: var(--sp-2);
			width: 100%;
			padding: var(--sp-3) var(--sp-4);
			background: none;
			border: 0;
			font-family: var(--font-display);
			font-size: var(--fs-sm);
			font-weight: 700;
			letter-spacing: var(--tracking-wide);
			text-transform: uppercase;
			cursor: pointer;
		}

		.badge {
			padding: 0 0.4rem;
			border-radius: 999px;
			background: var(--c-gold);
			color: var(--c-on-gold);
			font-size: var(--fs-xs);
		}

		.chev {
			margin-left: auto;
		}

		.filter-body {
			display: none;
			border-top: var(--border);
		}

		.filter-body.open {
			display: grid;
		}
	}
</style>
