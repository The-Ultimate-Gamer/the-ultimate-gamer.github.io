<script lang="ts">
	import { resolve } from '$app/paths';
	import { getCategories, getGames } from '#lib/data/client.ts';
	import { useResource } from '#lib/data/resource.svelte.ts';
	import DataView from '#lib/components/DataView.svelte';
	import PageTitle from '#lib/components/PageTitle.svelte';
	import CategoryBadge from '#lib/components/CategoryBadge.svelte';
	import EmptyState from '#lib/components/EmptyState.svelte';
	import LastUpdated from '#lib/components/LastUpdated.svelte';
	import { getCategoryContent } from '#lib/content/categories.ts';
	import type { GameInfo } from '#lib/data/types.ts';

	const games = useResource(getGames);
	const categories = useResource(getCategories);

	let filter = $state<string>('all');

	/** Category definitions from data; falls back to slugs referenced by games. */
	const categoryList = $derived.by(() => {
		if (categories.data)
			return categories.data.categories.map((c) => ({ slug: c.slug, name: c.name }));
		const slugs = new Set((games.data?.games ?? []).flatMap((g) => g.categories));
		return [...slugs].map((slug) => ({ slug, name: getCategoryContent(slug).name }));
	});

	function countFor(list: GameInfo[], slug: string) {
		return list.filter((g) => g.categories.includes(slug)).length;
	}

	function visible(list: GameInfo[]) {
		const filtered = filter === 'all' ? list : list.filter((g) => g.categories.includes(filter));
		return [...filtered].sort((a, b) => a.name.localeCompare(b.name));
	}
</script>

<svelte:head>
	<title>Games & categories · The Ultimate Gamer</title>
	<meta
		name="description"
		content="Browse the games of The Ultimate Gamer by category: played, available and never-picked titles."
	/>
</svelte:head>

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
			<div class="filters" role="group" aria-label="Filter by category">
				<button class="chip" aria-pressed={filter === 'all'} onclick={() => (filter = 'all')}>
					All <span class="num count">{list.length}</span>
				</button>
				{#each categoryList as c (c.slug)}
					<button class="chip" aria-pressed={filter === c.slug} onclick={() => (filter = c.slug)}>
						<span aria-hidden="true">{getCategoryContent(c.slug).icon}</span>
						{c.name}
						<span class="num count">{countFor(list, c.slug)}</span>
					</button>
				{/each}
			</div>

			{#if filter !== 'all'}
				{@const desc =
					categories.data?.categories.find((c) => c.slug === filter)?.description ||
					getCategoryContent(filter).blurb}
				{#if desc}<p class="cat-desc muted">{desc}</p>{/if}
			{/if}

			{@const shown = visible(list)}
			{#if shown.length}
				<ul class="games grid-cards" aria-live="polite">
					{#each shown as g (g.slug)}
						<li class="game" class:unplayed={!g.timesPlayed}>
							<div class="cats">
								{#each g.categories as c (c)}<CategoryBadge slug={c} size="sm" />{/each}
							</div>
							<h2>{g.name}</h2>
							{#if g.description}<p class="muted desc">{g.description}</p>{/if}
							<dl class="facts">
								{#if g.minPlayers || g.maxPlayers}
									<div>
										<dt>Players</dt>
										<dd class="num">
											{g.minPlayers ?? '?'}{g.maxPlayers && g.maxPlayers !== g.minPlayers
												? `–${g.maxPlayers}`
												: ''}
										</dd>
									</div>
								{/if}
								<div>
									<dt>Played</dt>
									<dd class="num">{g.timesPlayed ?? 0}×</dd>
								</div>
								{#if g.timesNominated != null}
									<div>
										<dt>Nominated</dt>
										<dd class="num">{g.timesNominated}×</dd>
									</div>
								{/if}
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
				<EmptyState
					title="No games in this category"
					message="No games have been added to this category yet."
				/>
			{/if}
		{/snippet}
	</DataView>
</div>

<style>
	.filters {
		display: flex;
		flex-wrap: wrap;
		gap: var(--sp-2);
	}

	.chip {
		display: inline-flex;
		align-items: center;
		gap: 0.4rem;
		padding: 0.4rem 0.75rem;
		background: var(--c-surface);
		border: var(--border-strong);
		border-radius: 999px;
		font-size: var(--fs-sm);
		font-weight: 600;
		cursor: pointer;
		transition:
			border-color var(--t-fast),
			background var(--t-fast);
	}

	.chip:hover {
		border-color: var(--c-gold-line);
	}

	.chip[aria-pressed='true'] {
		background: var(--c-gold);
		border-color: var(--c-gold);
		color: var(--c-on-gold);
	}

	.count {
		font-size: var(--fs-xs);
		opacity: 0.7;
	}

	.cat-desc {
		max-width: 65ch;
	}

	.games {
		list-style: none;
		margin: 0;
		padding: 0;
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

	.tag {
		padding: 0.1rem 0.45rem;
		border-radius: var(--radius-sm);
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		font-size: 0.65rem;
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
</style>
