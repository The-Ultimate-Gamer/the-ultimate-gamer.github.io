<script lang="ts">
	import type { GameRef, StandingEntry, TournamentSummary } from '#lib/data/types.ts';
	import { formatDateRange } from '#lib/format.ts';
	import CategoryBadge from './CategoryBadge.svelte';
	import StatusPill from './StatusPill.svelte';

	interface Props {
		tournament: TournamentSummary;
		standings: StandingEntry[];
		currentCategory?: string | null;
		currentGame?: GameRef | null;
		showName?: boolean;
	}

	let { tournament, standings, currentCategory, currentGame, showName = true }: Props = $props();

	const challengers = $derived(standings.filter((s) => s.isChallenger).length);
	const dates = $derived(formatDateRange(tournament.startDate, tournament.endDate));
</script>

<div class="meta-line">
	<StatusPill status={tournament.status} />
	{#if showName}<span class="tournament-name">{tournament.name}</span>{/if}
	{#if dates}<span class="subtle">{dates}</span>{/if}
	{#if tournament.location}<span class="subtle">· {tournament.location}</span>{/if}
</div>

<dl class="tiles">
	{#if tournament.status !== 'completed'}
		<div class="tile">
			<dt>Category</dt>
			<dd>
				{#if currentCategory}
					<CategoryBadge slug={currentCategory} size="lg" />
				{:else}
					<span class="subtle">Not started</span>
				{/if}
			</dd>
		</div>
		<div class="tile">
			<dt>Game</dt>
			<dd class="game">
				{#if currentGame}
					{currentGame.name}
				{:else if tournament.status === 'ongoing'}
					<span class="subtle">To be revealed</span>
				{:else}
					<span class="subtle">–</span>
				{/if}
			</dd>
		</div>
	{/if}
	<div class="tile threshold">
		<dt>Challenger at</dt>
		<dd>
			{#if tournament.challengerThreshold != null}
				<span class="big num">{tournament.challengerThreshold}</span> <span class="unit">pts</span>
			{:else}
				<span class="subtle">Not announced</span>
			{/if}
		</dd>
	</div>
	<div class="tile">
		<dt>Challengers</dt>
		<dd><span class="big num">{challengers}</span></dd>
	</div>
	<div class="tile">
		<dt>Games played</dt>
		<dd>
			<span class="big num">{tournament.gamesPlayed ?? 0}</span>
			{#if tournament.categoriesPlanned}
				<span class="unit">/ {tournament.categoriesPlanned}</span>
			{/if}
		</dd>
	</div>
</dl>

<style>
	.meta-line {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: var(--sp-2) var(--sp-3);
		font-size: var(--fs-sm);
	}

	.tournament-name {
		font-family: var(--font-display);
		font-weight: 700;
		font-size: var(--fs-lg);
		text-transform: uppercase;
		letter-spacing: var(--tracking-wide);
	}

	.tiles {
		margin: var(--sp-5) 0 0;
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(min(100%, 10rem), 1fr));
		gap: 0;
		background: rgb(19 19 23 / 0.9);
		border: var(--border);
		border-radius: var(--radius-lg);
		overflow: hidden;
	}

	.tile {
		box-shadow:
			1px 0 0 var(--c-border),
			0 1px 0 var(--c-border);
		padding: var(--sp-3) var(--sp-4);
		display: grid;
		align-content: start;
		gap: var(--sp-2);
		min-width: 0;
	}

	dt {
		font-size: 0.68rem;
		font-weight: 700;
		letter-spacing: var(--tracking-wider);
		text-transform: uppercase;
		color: var(--c-text-subtle);
	}

	dd {
		margin: 0;
		min-height: 1.9rem;
		display: flex;
		align-items: baseline;
		gap: 0.3rem;
	}

	.game {
		font-family: var(--font-display);
		font-weight: 700;
		font-size: var(--fs-lg);
		overflow-wrap: anywhere;
	}

	.big {
		font-size: var(--fs-2xl);
		font-weight: 700;
		line-height: 1;
	}

	.threshold .big {
		color: var(--c-challenger);
	}

	.unit {
		font-size: var(--fs-sm);
		color: var(--c-text-subtle);
	}
</style>
