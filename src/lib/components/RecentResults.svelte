<script lang="ts">
	import { resolve } from '$app/paths';
	import type { GameResult } from '#lib/data/types.ts';
	import { formatDateTime, ordinal } from '#lib/format.ts';
	import CategoryBadge from './CategoryBadge.svelte';

	interface Props {
		results: GameResult[];
		/** Number of placements to show per game. */
		podium?: number;
		/** Link each game to its tournament page when a tournament ref is present. */
		linkTournament?: boolean;
	}

	let { results, podium = 3, linkTournament = true }: Props = $props();

	const ordered = $derived([...results].sort((a, b) => b.number - a.number));
</script>

<ol class="results">
	{#each ordered as result (`${result.tournament?.slug ?? ''}-${result.number}`)}
		{@const top = [...(result.results ?? [])]
			.sort((a, b) => a.placement - b.placement)
			.slice(0, podium)}
		<li class="result" class:decider={result.decidedTournament} id="game-{result.number}">
			<header>
				<span class="game-no num">#{result.number}</span>
				<CategoryBadge slug={result.category} size="sm" />
				{#if result.playedAt}
					<time class="when subtle" datetime={result.playedAt}
						>{formatDateTime(result.playedAt)}</time
					>
				{/if}
			</header>

			<h3 class="game-name">
				{#if linkTournament && result.tournament}
					<a
						href="{resolve('/tournaments/[slug]', {
							slug: result.tournament.slug
						})}#game-{result.number}">{result.game.name}</a
					>
				{:else}
					{result.game.name}
				{/if}
			</h3>

			{#if result.decidedTournament && result.winner}
				<p class="flag gold">
					<span aria-hidden="true">👑</span> Challenger win — {result.winner.name} became the Ultimate
					Gamer
				</p>
			{/if}

			{#if top.length}
				<ol class="podium">
					{#each top as r (r.player.slug)}
						<li class:first={r.placement === 1}>
							<span class="place num">{ordinal(r.placement)}</span>
							<a class="who" href={resolve('/players/[slug]', { slug: r.player.slug })}
								>{r.player.name}</a
							>
							<span class="tags">
								{#if r.doubleDown}<span class="tag dd" title="Double Down used">2×</span>{/if}
								{#if r.defeatedNemesis}<span class="tag nem" title="Defeated their Nemesis"
										>+1 Nemesis</span
									>{/if}
							</span>
							<span class="pts num">+{r.points}</span>
						</li>
					{/each}
				</ol>
			{:else if result.winner}
				<p class="muted">
					Winner:
					<a href={resolve('/players/[slug]', { slug: result.winner.slug })}>{result.winner.name}</a
					>
				</p>
			{/if}

			{#if result.newChallengers?.length}
				<p class="flag challenger">
					<span aria-hidden="true">⚔</span> New Challenger{result.newChallengers.length > 1
						? 's'
						: ''}: {result.newChallengers.map((p) => p.name).join(', ')}
				</p>
			{/if}
		</li>
	{/each}
</ol>

<style>
	.results {
		list-style: none;
		margin: 0;
		padding: 0;
		display: grid;
		gap: var(--sp-4);
		grid-template-columns: repeat(auto-fill, minmax(min(100%, 19rem), 1fr));
	}

	.result {
		display: grid;
		align-content: start;
		gap: var(--sp-3);
		padding: var(--sp-4);
		background: var(--c-surface);
		border: var(--border);
		border-radius: var(--radius-lg);
		scroll-margin-top: 5rem;
	}

	.decider {
		border-color: var(--c-gold-line);
		box-shadow: var(--glow-gold);
	}

	header {
		display: flex;
		align-items: center;
		gap: var(--sp-2);
		flex-wrap: wrap;
	}

	.game-no {
		font-weight: 700;
		color: var(--c-text-subtle);
	}

	.when {
		margin-left: auto;
		font-size: var(--fs-xs);
	}

	.game-name {
		font-size: var(--fs-xl);
	}

	.game-name a {
		text-decoration: none;
	}

	.podium {
		list-style: none;
		margin: 0;
		padding: 0;
		display: grid;
		gap: 0.35rem;
	}

	.podium li {
		display: grid;
		grid-template-columns: 2.6rem 1fr auto auto;
		align-items: center;
		gap: var(--sp-2);
		font-size: var(--fs-sm);
	}

	.place {
		font-size: var(--fs-xs);
		color: var(--c-text-subtle);
	}

	.first .place {
		color: var(--c-gold);
		font-weight: 700;
	}

	.who {
		text-decoration: none;
		font-weight: 600;
		min-width: 0;
		overflow-wrap: anywhere;
	}

	.first .who {
		color: var(--c-text);
	}

	.pts {
		color: var(--c-text-muted);
		font-weight: 700;
	}

	.first .pts {
		color: var(--c-gold-bright);
	}

	.tags {
		display: inline-flex;
		gap: 0.25rem;
	}

	.tag {
		font-size: 0.62rem;
		font-weight: 700;
		padding: 0.05rem 0.35rem;
		border-radius: var(--radius-sm);
		text-transform: uppercase;
		letter-spacing: 0.04em;
	}

	.dd {
		background: var(--c-gold-soft);
		color: var(--c-gold-bright);
	}

	.nem {
		background: rgb(169 139 255 / 0.15);
		color: var(--c-violet);
	}

	.flag {
		font-size: var(--fs-xs);
		font-weight: 600;
		padding: var(--sp-2) var(--sp-3);
		border-radius: var(--radius-sm);
	}

	.flag.gold {
		background: var(--c-gold-soft);
		color: var(--c-gold-bright);
	}

	.flag.challenger {
		background: var(--c-challenger-soft);
		color: var(--c-challenger);
	}
</style>
