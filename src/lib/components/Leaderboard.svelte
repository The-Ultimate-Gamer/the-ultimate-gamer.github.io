<script lang="ts">
	import type { PointsTableEntry, StandingEntry } from '#lib/data/types.ts';
	import { ordinal } from '#lib/format.ts';
	import PlayerRow from './PlayerRow.svelte';

	interface Props {
		standings: StandingEntry[];
		threshold?: number | null;
		caption?: string;
		showTokens?: boolean;
		/** Shown in the legend so everyone knows what each place is worth. */
		pointsTable?: PointsTableEntry[] | null;
		/** Called with a player's slug when their name is clicked. */
		onselect?: (slug: string) => void;
	}

	let {
		standings,
		threshold,
		caption = 'Current standings',
		showTokens = true,
		pointsTable,
		onselect
	}: Props = $props();

	const rows = $derived([...standings].sort((a, b) => a.rank - b.rank));
	const points = $derived([...(pointsTable ?? [])].sort((a, b) => a.placement - b.placement));
</script>

<div class="leaderboard table-scroll">
	<table>
		<caption class="visually-hidden">{caption}</caption>
		<thead>
			<tr>
				<th scope="col" class="c-rank">#</th>
				<th scope="col">Player</th>
				<th scope="col" class="c-points">Points</th>
				<th scope="col" class="c-wins">Category wins</th>
				{#if showTokens}<th scope="col" class="c-tokens">Tokens</th>{/if}
			</tr>
		</thead>
		<tbody>
			{#each rows as entry (entry.player.slug)}
				<PlayerRow {entry} {threshold} {showTokens} {onselect} />
			{/each}
		</tbody>
	</table>
</div>

{#if points.length || threshold != null}
	<div class="legend">
		{#if points.length}
			<p>
				<span class="key">Points per place</span>
				{#each points as p (p.placement)}
					<span class="item"
						><span class="subtle">{ordinal(p.placement)}</span>
						<span class="num">{p.points}</span></span
					>
				{/each}
				<span class="subtle">· +1 for beating your Nemesis · ×2 with Double Down</span>
			</p>
		{/if}
		{#if threshold != null}
			<p>
				<span class="key">Challenger at</span>
				<span class="item"><strong class="num threshold">{threshold}</strong> pts</span>
				<span class="subtle">· then win one more game to become the Ultimate Gamer</span>
			</p>
		{/if}
	</div>
{/if}

<style>
	.leaderboard {
		width: 100%;
	}

	table {
		width: 100%;
		table-layout: auto;
	}

	th {
		text-align: left;
		padding: var(--sp-3);
		font-family: var(--font-display);
		font-size: var(--fs-xs);
		font-weight: 700;
		letter-spacing: var(--tracking-wider);
		text-transform: uppercase;
		color: var(--c-text-subtle);
		border-bottom: var(--border-strong);
		white-space: nowrap;
	}

	.c-rank {
		padding-left: var(--sp-5);
	}

	.c-tokens {
		padding-right: var(--sp-5);
	}

	tbody :global(tr:last-child > *) {
		border-bottom: 0;
	}

	.legend {
		display: grid;
		gap: var(--sp-1);
		padding: var(--sp-3) var(--sp-5);
		border-top: var(--border);
		font-size: var(--fs-xs);
		color: var(--c-text-muted);
	}

	.legend p {
		display: flex;
		flex-wrap: wrap;
		align-items: baseline;
		gap: var(--sp-1) var(--sp-3);
	}

	.key {
		font-family: var(--font-display);
		font-weight: 700;
		letter-spacing: var(--tracking-wide);
		text-transform: uppercase;
		color: var(--c-text-subtle);
	}

	.item {
		white-space: nowrap;
	}

	.threshold {
		color: var(--c-challenger);
		font-size: var(--fs-sm);
	}

	@media (max-width: 760px) {
		.c-wins {
			display: none;
		}
		.c-rank {
			padding-left: var(--sp-3);
		}
		th {
			letter-spacing: var(--tracking-wide);
		}
		.c-tokens {
			padding-right: var(--sp-3);
		}
		.legend {
			padding-inline: var(--sp-3);
		}
	}
</style>
