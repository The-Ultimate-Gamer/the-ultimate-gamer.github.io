<script lang="ts">
	import { resolve } from '$app/paths';
	import type { CategoryProgressEntry } from '#lib/data/types.ts';
	import { getCategoryContent } from '#lib/content/categories.ts';

	interface Props {
		categories: CategoryProgressEntry[];
		/** Open a played game's full results. */
		onselect?: (gameNumber: number) => void;
	}

	let { categories, onselect }: Props = $props();

	const items = $derived([...categories].sort((a, b) => a.order - b.order));

	const statusText = { completed: 'Completed', active: 'Now playing', upcoming: 'Upcoming' };

	function accent(slug: string): string {
		return /^[a-z0-9-]+$/.test(slug) ? `var(--cat-${slug}, var(--c-gold))` : 'var(--c-gold)';
	}
</script>

<ol class="progress">
	{#each items as item (item.order)}
		{@const cat = getCategoryContent(item.category)}
		<li class={item.status} style:--accent={accent(item.category)}>
			<span class="marker" aria-hidden="true">
				{#if item.status === 'completed'}✓{:else}{item.order}{/if}
			</span>
			<div class="content">
				<p class="head">
					<span class="icon" aria-hidden="true">{cat.icon}</span>
					<span class="cat-name">{cat.name}</span>
					<span class="state">{statusText[item.status]}</span>
				</p>
				{#if item.game || item.winner}
					<p class="detail">
						{#if item.game && item.status === 'completed' && item.gameNumber && onselect}
							{@const number = item.gameNumber}
							<button class="game open" type="button" onclick={() => onselect(number)}
								>{item.game.name} <span class="subtle" aria-hidden="true">›</span><span
									class="visually-hidden">: show results</span
								></button
							>
						{:else if item.game}<span class="game">{item.game.name}</span>{/if}
						{#if item.winner}
							<span class="winner">
								<span aria-hidden="true">🏆</span>
								<a href={resolve('/players/[slug]', { slug: item.winner.slug })}
									>{item.winner.name}</a
								>
							</span>
						{/if}
					</p>
				{:else if item.status === 'active'}
					<p class="detail subtle">Game to be revealed</p>
				{/if}
			</div>
		</li>
	{/each}
</ol>

<style>
	.progress {
		list-style: none;
		margin: 0;
		padding: 0;
		display: grid;
	}

	li {
		position: relative;
		display: grid;
		grid-template-columns: 1.75rem 1fr;
		gap: var(--sp-3);
		padding-bottom: var(--sp-4);
	}

	li:not(:last-child)::before {
		content: '';
		position: absolute;
		left: calc(0.875rem - 1px);
		top: 1.85rem;
		bottom: 0.1rem;
		width: 2px;
		background: var(--c-border);
	}

	li.completed:not(:last-child)::before {
		background: var(--c-border-strong);
	}

	.marker {
		display: grid;
		place-items: center;
		width: 1.75rem;
		height: 1.75rem;
		border-radius: 50%;
		font-family: var(--font-mono);
		font-size: 0.7rem;
		font-weight: 700;
		border: 1px solid var(--c-border-strong);
		color: var(--c-text-subtle);
		background: var(--c-bg);
	}

	.completed .marker {
		background: var(--c-surface-3);
		color: var(--c-text-muted);
	}

	.active .marker {
		background: var(--accent);
		border-color: var(--accent);
		color: #0b0b0d;
		box-shadow: 0 0 0 4px color-mix(in srgb, var(--accent) 20%, transparent);
		animation: pulse 2.4s ease-in-out infinite;
	}

	.content {
		min-width: 0;
		padding-top: 0.15rem;
	}

	.head {
		display: flex;
		align-items: center;
		gap: var(--sp-2);
		flex-wrap: wrap;
	}

	.cat-name {
		font-family: var(--font-display);
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: var(--tracking-wide);
		font-size: var(--fs-sm);
	}

	.upcoming .cat-name,
	.upcoming .icon {
		opacity: 0.6;
	}

	.active .cat-name {
		color: color-mix(in srgb, var(--accent) 75%, white);
	}

	.state {
		margin-left: auto;
		font-size: 0.65rem;
		letter-spacing: var(--tracking-wide);
		text-transform: uppercase;
		color: var(--c-text-subtle);
	}

	.active .state {
		color: var(--c-live);
		font-weight: 700;
	}

	.detail {
		display: flex;
		flex-wrap: wrap;
		gap: var(--sp-1) var(--sp-3);
		margin-top: 0.15rem;
		font-size: var(--fs-sm);
		color: var(--c-text-muted);
	}

	.open {
		padding: 0;
		background: none;
		border: 0;
		color: var(--c-text);
		font-weight: 600;
		text-align: left;
		cursor: pointer;
		text-decoration: underline;
		text-decoration-color: var(--c-gold-line);
		text-underline-offset: 0.2em;
	}

	.open:hover {
		color: var(--c-gold-bright);
	}

	.winner a {
		color: var(--c-text);
		text-decoration: none;
		font-weight: 600;
	}

	@keyframes pulse {
		50% {
			box-shadow: 0 0 0 7px color-mix(in srgb, var(--accent) 8%, transparent);
		}
	}
</style>
