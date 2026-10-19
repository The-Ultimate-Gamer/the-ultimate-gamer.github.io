<script lang="ts">
	import { resolve } from '$app/paths';
	import type { GameResult } from '#lib/data/types.ts';
	import { formatDateTime, ordinal } from '#lib/format.ts';
	import CategoryBadge from './CategoryBadge.svelte';
	import GameSelectionPanel from './GameSelectionPanel.svelte';

	interface Props {
		result: GameResult;
	}

	let { result }: Props = $props();

	const rows = $derived([...(result.results ?? [])].sort((a, b) => a.placement - b.placement));
</script>

<div class="detail">
	<p class="meta">
		<CategoryBadge slug={result.category} />
		{#if result.playedAt}
			<time class="subtle" datetime={result.playedAt}>{formatDateTime(result.playedAt)}</time>
		{/if}
	</p>

	{#if result.decidedTournament && result.winner}
		<p class="flag gold">
			<span aria-hidden="true">👑</span> Challenger win: {result.winner.name} became the Ultimate Gamer
		</p>
	{/if}

	{#if rows.length}
		<div class="table-scroll">
			<table class="data-table">
				<caption class="visually-hidden"
					>Results of game {result.number}, {result.game.name}</caption
				>
				<thead>
					<tr>
						<th scope="col">Place</th>
						<th scope="col">Player</th>
						<th scope="col">Points</th>
					</tr>
				</thead>
				<tbody>
					{#each rows as r (r.player.slug)}
						<tr class:first={r.placement === 1}>
							<td class="num place">{ordinal(r.placement)}</td>
							<th scope="row">
								<a href={resolve('/players/[slug]', { slug: r.player.slug })}>{r.player.name}</a>
								{#if r.nemesis}
									<span class="nemesis subtle">
										Nemesis {r.nemesis.name}{#if r.defeatedNemesis}
											<span class="tag nem">beaten +1</span>{/if}
									</span>
								{/if}
							</th>
							<td class="pts">
								<span class="num total">+{r.points}</span>
								{#if r.basePoints != null && (r.nemesisBonus || r.doubleDown)}
									<span class="num breakdown subtle">
										{#if r.doubleDown}({r.basePoints}{r.nemesisBonus ? ` + ${r.nemesisBonus}` : ''})
											× 2{:else}{r.basePoints} + {r.nemesisBonus}{/if}
									</span>
								{/if}
								{#if r.doubleDown}<span class="tag dd">Double Down</span>{/if}
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{:else if result.winner}
		<p class="muted">
			Winner:
			<a href={resolve('/players/[slug]', { slug: result.winner.slug })}>{result.winner.name}</a>
		</p>
	{:else}
		<p class="subtle">No results recorded for this game.</p>
	{/if}

	{#if result.newChallengers?.length}
		<p class="flag challenger">
			<span aria-hidden="true">⚔</span> New Challenger{result.newChallengers.length > 1 ? 's' : ''}:
			{result.newChallengers.map((p) => p.name).join(', ')}
		</p>
	{/if}

	{#if result.selection?.nominations?.length}
		<section class="picked" aria-label="How the game was picked">
			<h3 class="eyebrow">How it was picked</h3>
			<GameSelectionPanel selection={result.selection} />
		</section>
	{/if}
</div>

<style>
	.detail {
		display: grid;
		gap: var(--sp-4);
	}

	.meta {
		display: flex;
		align-items: center;
		flex-wrap: wrap;
		gap: var(--sp-3);
		font-size: var(--fs-sm);
	}

	.data-table a {
		text-decoration: none;
	}

	.place {
		width: 3.5rem;
		color: var(--c-text-subtle);
	}

	.first .place {
		color: var(--c-gold);
		font-weight: 700;
	}

	.nemesis {
		display: block;
		font-size: var(--fs-xs);
		font-weight: 400;
	}

	.pts {
		white-space: nowrap;
	}

	.total {
		font-weight: 700;
	}

	.first .total {
		color: var(--c-gold-bright);
	}

	.breakdown {
		display: block;
		font-size: var(--fs-xs);
	}

	.tag {
		display: inline-block;
		margin-top: 0.15rem;
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
		font-size: var(--fs-sm);
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

	.picked {
		display: grid;
		gap: var(--sp-3);
	}
</style>
