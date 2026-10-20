<script lang="ts">
	import { safeLink } from '#lib/links.ts';
	import { resolve } from '$app/paths';
	import type { GameSelection } from '#lib/data/types.ts';
	import CategoryBadge from './CategoryBadge.svelte';

	interface Props {
		selection: GameSelection;
	}

	let { selection }: Props = $props();

	const sourceLabel: Record<string, string> = {
		winner: 'Winner’s pick',
		vote: 'Player vote',
		token: 'Nominate token'
	};

	const drawn = $derived(selection.status === 'drawn' && selection.selected);
</script>

<div class="selection">
	<div class="head">
		{#if selection.category}<CategoryBadge slug={selection.category} />{/if}
		<span class="state" class:done={drawn}>
			{drawn ? 'Game drawn' : 'Draw pending'}
		</span>
	</div>

	{#if drawn && selection.selected}
		<p class="selected">
			<span class="eyebrow">Selected</span>
			<span class="selected-name">{selection.selected.name}</span>
			{#if safeLink(selection.selected.url)}
				<a
					class="get"
					href={safeLink(selection.selected.url)}
					target="_blank"
					rel="noopener noreferrer external">Get the game <span aria-hidden="true">↗</span></a
				>
			{/if}
		</p>
	{/if}

	{#if selection.nominations?.length}
		<ul class="nominations" aria-label="Nominations">
			{#each selection.nominations as nom, i (`${nom.game.slug}-${i}`)}
				<li class:picked={drawn && selection.selected?.slug === nom.game.slug}>
					<span class="game">{nom.game.name}</span>
					<span class="by">
						{sourceLabel[nom.source] ?? nom.source}
						{#if nom.nominatedBy}
							·
							<a href={resolve('/players/[slug]', { slug: nom.nominatedBy.slug })}
								>{nom.nominatedBy.name}</a
							>
						{/if}
						{#if nom.entries && nom.entries > 1}<span class="num"> ×{nom.entries}</span>{/if}
					</span>
				</li>
			{/each}
		</ul>
	{:else if !drawn}
		<p class="subtle empty">Nominations have not been recorded yet.</p>
	{/if}
</div>

<style>
	.selection {
		display: grid;
		gap: var(--sp-3);
	}

	.head {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--sp-2);
		flex-wrap: wrap;
	}

	.state {
		font-size: 0.7rem;
		font-weight: 700;
		letter-spacing: var(--tracking-wide);
		text-transform: uppercase;
		color: var(--c-info);
	}

	.state::before {
		content: '◌ ';
	}

	.state.done {
		color: var(--c-live);
	}

	.state.done::before {
		content: '✓ ';
	}

	.selected {
		display: grid;
		gap: 0.15rem;
		padding: var(--sp-3) var(--sp-4);
		border: 1px solid var(--c-gold-line);
		background: var(--c-gold-soft);
		border-radius: var(--radius-md);
	}

	.get {
		justify-self: start;
		font-size: var(--fs-sm);
		font-weight: 600;
		text-decoration: none;
	}

	.selected-name {
		font-family: var(--font-display);
		font-size: var(--fs-xl);
		font-weight: 700;
	}

	.nominations {
		list-style: none;
		margin: 0;
		padding: 0;
		display: grid;
		gap: 1px;
		background: var(--c-border);
		border: var(--border);
		border-radius: var(--radius-md);
		overflow: hidden;
	}

	li {
		display: flex;
		justify-content: space-between;
		gap: var(--sp-3);
		padding: var(--sp-2) var(--sp-3);
		background: var(--c-surface);
		font-size: var(--fs-sm);
		flex-wrap: wrap;
	}

	li.picked {
		background: var(--c-surface-3);
	}

	li.picked .game::after {
		content: ' ✓';
		color: var(--c-gold);
	}

	.game {
		font-weight: 600;
	}

	.by {
		color: var(--c-text-subtle);
		font-size: var(--fs-xs);
	}

	.by a {
		color: var(--c-text-muted);
	}

	.empty {
		font-size: var(--fs-sm);
	}
</style>
