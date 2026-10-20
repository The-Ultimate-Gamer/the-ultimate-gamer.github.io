<script lang="ts">
	import { resolve } from '$app/paths';
	import type { PlayerMatch, PlayerProfile } from '#lib/data/types.ts';
	import { getCategoryContent } from '#lib/content/categories.ts';
	import CategoryBadge from './CategoryBadge.svelte';

	interface Props {
		player: PlayerProfile;
		/** Limit to one tournament. */
		tournament?: string | null;
	}

	let { player, tournament = null }: Props = $props();

	/** Won games grouped per category, most wins first. */
	const groups = $derived.by(() => {
		const map = new Map<string, PlayerMatch[]>();
		for (const m of player.matches ?? []) {
			if (m.placement !== 1 || (tournament && m.tournament.slug !== tournament)) continue;
			map.set(m.category, [...(map.get(m.category) ?? []), m]);
		}
		// Career totals are published separately; use them when match history is missing.
		if (!map.size && !tournament) {
			return (player.categoryWins ?? []).map((c) => ({
				category: c.category,
				wins: c.wins,
				games: [] as PlayerMatch[]
			}));
		}
		return [...map]
			.map(([category, games]) => ({ category, wins: games.length, games }))
			.sort((a, b) => b.wins - a.wins);
	});
</script>

{#if groups.length}
	<ul class="cats">
		{#each groups as g (g.category)}
			<li>
				<div class="row">
					<CategoryBadge slug={g.category} />
					<span class="num wins">×{g.wins}</span>
				</div>
				{#if getCategoryContent(g.category).blurb}
					<p class="muted desc">{getCategoryContent(g.category).blurb}</p>
				{/if}
				{#if g.games.length}
					<ul class="games">
						{#each g.games as m (`${m.tournament.slug}-${m.gameNumber}`)}
							<li>
								<a
									href="{resolve('/tournaments/[slug]', {
										slug: m.tournament.slug
									})}#game-{m.gameNumber}">{m.game.name}</a
								>
								<span class="subtle"
									>#{m.gameNumber}{#if !tournament}
										· {m.tournament.name}{/if}</span
								>
								{#if m.doubleDown}<span class="note">Double Down</span>{/if}
							</li>
						{/each}
					</ul>
				{/if}
			</li>
		{/each}
	</ul>
{:else}
	<p class="subtle">No games won {tournament ? 'in this tournament' : 'yet'}.</p>
{/if}

<style>
	.cats {
		list-style: none;
		margin: 0;
		padding: 0;
		display: grid;
		gap: var(--sp-4);
	}

	.cats > li {
		display: grid;
		gap: var(--sp-2);
		padding-bottom: var(--sp-4);
		border-bottom: var(--border);
	}

	.cats > li:last-child {
		border-bottom: 0;
		padding-bottom: 0;
	}

	.row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--sp-2);
	}

	.wins {
		font-size: var(--fs-lg);
		font-weight: 700;
		color: var(--c-gold-bright);
	}

	.desc {
		font-size: var(--fs-xs);
	}

	.games {
		list-style: none;
		margin: 0;
		padding: 0;
		display: grid;
		gap: 0.25rem;
		font-size: var(--fs-sm);
	}

	.games li {
		display: flex;
		flex-wrap: wrap;
		align-items: baseline;
		gap: var(--sp-2);
	}

	.games a {
		font-weight: 600;
		text-decoration: none;
	}

	.subtle {
		font-size: var(--fs-xs);
	}

	.note {
		padding: 0.05rem 0.35rem;
		border-radius: var(--radius-sm);
		background: var(--c-gold-soft);
		color: var(--c-gold-bright);
		font-size: var(--fs-xs);
		font-weight: 600;
	}
</style>
