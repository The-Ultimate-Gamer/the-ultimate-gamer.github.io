<script lang="ts">
	import { resolve } from '$app/paths';
	import type { PlayerProfile } from '#lib/data/types.ts';
	import { ordinal } from '#lib/format.ts';
	import CategoryBadge from './CategoryBadge.svelte';

	interface Props {
		player: PlayerProfile;
		tournament: { slug: string; name: string };
	}

	let { player: p, tournament }: Props = $props();

	const matches = $derived((p.matches ?? []).filter((m) => m.tournament.slug === tournament.slug));
</script>

{#if matches.length}
	<div class="table-scroll">
		<table class="data-table">
			<caption class="visually-hidden">{p.name}’s games in {tournament.name}</caption>
			<thead>
				<tr>
					<th scope="col">Game</th>
					<th scope="col">Place</th>
					<th scope="col">Points</th>
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

<style>
	.data-table th[scope='row'] {
		font-weight: 600;
		text-align: left;
	}

	a {
		text-decoration: none;
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

	.place {
		white-space: nowrap;
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
</style>
