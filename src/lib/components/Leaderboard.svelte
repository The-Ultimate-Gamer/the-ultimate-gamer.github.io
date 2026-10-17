<script lang="ts">
	import type { StandingEntry } from '#lib/data/types.ts';
	import PlayerRow from './PlayerRow.svelte';

	interface Props {
		standings: StandingEntry[];
		threshold?: number | null;
		caption?: string;
		showTokens?: boolean;
	}

	let { standings, threshold, caption = 'Current standings', showTokens = true }: Props = $props();

	const rows = $derived([...standings].sort((a, b) => a.rank - b.rank));
</script>

<div class="leaderboard">
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

	@media (max-width: 760px) {
		.c-wins {
			display: none;
		}
		.c-rank {
			padding-left: var(--sp-3);
		}
	}
</style>
