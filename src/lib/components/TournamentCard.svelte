<script lang="ts">
	import { resolve } from '$app/paths';
	import type { TournamentSummary } from '#lib/data/types.ts';
	import { formatDateRange, plural } from '#lib/format.ts';
	import StatusPill from './StatusPill.svelte';

	interface Props {
		tournament: TournamentSummary;
	}

	let { tournament }: Props = $props();
	const href = $derived(resolve('/tournaments/[slug]', { slug: tournament.slug }));
</script>

<article class="card" class:done={tournament.status === 'completed'}>
	<header>
		<StatusPill status={tournament.status} />
		<span class="subtle date">{formatDateRange(tournament.startDate, tournament.endDate)}</span>
	</header>
	<h3><a {href}>{tournament.name}</a></h3>
	{#if tournament.location}<p class="subtle loc">{tournament.location}</p>{/if}

	<div class="champ">
		<span class="eyebrow">Ultimate Gamer</span>
		{#if tournament.champion}
			<a class="champ-name" href={resolve('/players/[slug]', { slug: tournament.champion.slug })}>
				<span aria-hidden="true">👑</span>
				{tournament.champion.name}
			</a>
		{:else}
			<span class="subtle">{tournament.status === 'completed' ? 'Not recorded' : 'Undecided'}</span>
		{/if}
	</div>

	{#if tournament.leaders?.length}
		<ol class="leaders" aria-label="Leading players">
			{#each tournament.leaders as l (l.player.slug)}
				<li>
					<span class="num rank">{l.rank}</span>
					<span class="name">{l.player.name}</span>
					<span class="num pts">{l.points}</span>
				</li>
			{/each}
		</ol>
	{/if}

	<footer class="subtle">
		{#if tournament.playerCount != null}<span>{plural(tournament.playerCount, 'player')}</span>{/if}
		{#if tournament.gamesPlayed != null}<span>{plural(tournament.gamesPlayed, 'game')}</span>{/if}
		{#if tournament.categoriesCompleted != null}
			<span
				>{tournament.categoriesCompleted}{tournament.categoriesPlanned
					? `/${tournament.categoriesPlanned}`
					: ''} categories</span
			>
		{/if}
		{#if tournament.awards?.length}<span>{plural(tournament.awards.length, 'award')}</span>{/if}
	</footer>
</article>

<style>
	.card {
		position: relative;
		display: grid;
		align-content: start;
		gap: var(--sp-3);
		padding: var(--sp-5);
		background: var(--c-surface);
		border: var(--border);
		border-radius: var(--radius-lg);
		transition:
			border-color var(--t-base),
			transform var(--t-base) var(--ease-out);
	}

	.card:hover,
	.card:focus-within {
		border-color: var(--c-gold-line);
		transform: translateY(-2px);
	}

	header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--sp-2);
		flex-wrap: wrap;
	}

	.date,
	.loc {
		font-size: var(--fs-xs);
	}

	h3 {
		font-size: var(--fs-xl);
		text-transform: uppercase;
	}

	h3 a {
		text-decoration: none;
	}

	/* Make the whole card clickable while keeping a single link in the tab order. */
	h3 a::after {
		content: '';
		position: absolute;
		inset: 0;
	}

	.champ {
		display: grid;
		gap: 0.2rem;
		padding: var(--sp-3);
		border-radius: var(--radius-md);
		background: var(--c-bg-raised);
		border: var(--border);
	}

	.champ-name {
		position: relative;
		z-index: 1;
		font-family: var(--font-display);
		font-size: var(--fs-lg);
		font-weight: 700;
		color: var(--c-gold-bright);
		text-decoration: none;
	}

	.leaders {
		list-style: none;
		margin: 0;
		padding: 0;
		display: grid;
		gap: 0.25rem;
		font-size: var(--fs-sm);
	}

	.leaders li {
		display: grid;
		grid-template-columns: 1.5rem 1fr auto;
		gap: var(--sp-2);
	}

	.rank {
		color: var(--c-text-subtle);
	}

	.pts {
		color: var(--c-text-muted);
	}

	footer {
		display: flex;
		flex-wrap: wrap;
		gap: var(--sp-1) var(--sp-4);
		font-size: var(--fs-xs);
		border-top: var(--border);
		padding-top: var(--sp-3);
	}
</style>
