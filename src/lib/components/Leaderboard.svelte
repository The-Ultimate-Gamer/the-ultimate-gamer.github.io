<script lang="ts">
	import type { PointsTableEntry, StandingEntry } from '#lib/data/types.ts';
	import { getAwardContent } from '#lib/content/awards.ts';
	import { getCategoryContent } from '#lib/content/categories.ts';
	import { ordinal } from '#lib/format.ts';
	import PlayerRow from './PlayerRow.svelte';

	interface Props {
		standings: StandingEntry[];
		threshold?: number | null;
		caption?: string;
		showTokens?: boolean;
		/** Shown in the legend so everyone knows what each place is worth. */
		pointsTable?: PointsTableEntry[] | null;
	}

	let {
		standings,
		threshold,
		caption = 'Current standings',
		showTokens = true,
		pointsTable
	}: Props = $props();

	// Already conveyed by the status badge.
	const STATUS_AWARDS = new Set(['challenger', 'ultimate-gamer']);

	const rows = $derived([...standings].sort((a, b) => a.rank - b.rank));

	/** Icons that appear in the table, so touch users (no hover) can read what they mean. */
	const legend = $derived.by(() => {
		const awards = new Set(standings.flatMap((s) => s.awards ?? []));
		const categories = new Set(standings.flatMap((s) => s.categoryWins ?? []));
		return [
			...[...awards].filter((a) => !STATUS_AWARDS.has(a)).map((a) => getAwardContent(a)),
			...[...categories].map((c) => getCategoryContent(c))
		];
	});
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
				<PlayerRow {entry} {threshold} {showTokens} />
			{/each}
		</tbody>
	</table>
</div>

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
	{#if showTokens}
		<p>
			<span class="key">Tokens left</span>
			<span class="item"><span class="num">D</span> Double Down</span>
			<span class="item"><span class="num">N</span> Nominate</span>
		</p>
	{/if}
	{#if legend.length}
		<p>
			<span class="key">Icons</span>
			{#each legend as item (item.slug)}
				<span class="item"><span aria-hidden="true">{item.icon}</span> {item.name}</span>
			{/each}
		</p>
	{/if}
</div>

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
