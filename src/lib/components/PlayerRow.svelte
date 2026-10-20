<script lang="ts">
	import { resolve } from '$app/paths';
	import type { StandingEntry } from '#lib/data/types.ts';
	import PlayerAvatar from './PlayerAvatar.svelte';
	import StatusBadge from './StatusBadge.svelte';
	import CategoryBadge from './CategoryBadge.svelte';
	import AwardBadge from './AwardBadge.svelte';
	import TokenDisplay from './TokenDisplay.svelte';
	import { getCategoryContent } from '#lib/content/categories.ts';

	interface Props {
		entry: StandingEntry;
		threshold?: number | null;
		showTokens?: boolean;
		/** When set, the name opens details instead of linking to the profile. */
		onselect?: (slug: string) => void;
	}

	let { entry, threshold, showTokens = true, onselect }: Props = $props();

	// Already conveyed by the status badge.
	const STATUS_AWARDS = new Set(['challenger', 'ultimate-gamer']);

	const status = $derived(
		entry.isChampion ? 'champion' : entry.isChallenger ? 'challenger' : 'contender'
	);
	const progress = $derived(
		threshold && threshold > 0 ? Math.min(entry.points / threshold, 1) : null
	);
	const toGo = $derived(
		threshold && !entry.isChallenger && !entry.isChampion
			? Math.max(threshold - entry.points, 0)
			: null
	);
</script>

<tr
	class="row {status}"
	class:leader={entry.rank === 1}
	class:clickable={!!onselect}
	onclick={onselect ? () => onselect(entry.player.slug) : undefined}
>
	<td class="rank">
		<span class="rank-num num">{entry.rank}</span>
	</td>
	<th scope="row" class="player">
		<div class="player-cell">
			<PlayerAvatar
				name={entry.player.name}
				avatarUrl={entry.player.avatarUrl}
				size="md"
				highlight={status === 'contender' ? null : status}
			/>
			<div class="who">
				{#if onselect}
					<button
						class="name"
						type="button"
						aria-haspopup="dialog"
						onclick={(e) => {
							e.stopPropagation();
							onselect(entry.player.slug);
						}}
					>
						{entry.player.name}
						<span class="visually-hidden">: show details</span>
					</button>
				{:else}
					<a class="name" href={resolve('/players/[slug]', { slug: entry.player.slug })}>
						{entry.player.name}
					</a>
				{/if}
				<div class="meta">
					<StatusBadge {status} size="sm" />
					{#if entry.isFirstTournament}<span class="rookie">First tournament</span>{/if}
					{#each (entry.awards ?? []).filter((a) => !STATUS_AWARDS.has(a)) as award (award)}
						<AwardBadge slug={award} iconOnly />
					{/each}
					{#if entry.categoryWins?.length}
						<!-- The category wins column is hidden on narrow screens; show them here instead. -->
						<span class="wins-inline">
							{#each entry.categoryWins as cat, i (`${cat}-${i}`)}
								<CategoryBadge
									slug={cat}
									iconOnly
									size="sm"
									tooltip="Won a {getCategoryContent(cat).name} game"
								/>
							{/each}
						</span>
					{/if}
				</div>
			</div>
		</div>
	</th>
	<td class="points">
		<span class="points-value num">{entry.points}</span>
		{#if progress !== null}
			<span class="bar" aria-hidden="true">
				<span class="fill" style:width="{progress * 100}%"></span>
			</span>
			{#if toGo !== null}
				<span class="to-go">{toGo} to Challenger</span>
			{:else if entry.challengerSinceGame}
				<span class="to-go">since game {entry.challengerSinceGame}</span>
			{/if}
		{/if}
	</td>
	<td class="wins">
		{#if entry.categoryWins?.length}
			<span class="cat-wins">
				{#each entry.categoryWins as cat, i (`${cat}-${i}`)}
					<CategoryBadge
						slug={cat}
						iconOnly
						size="sm"
						tooltip="Won a {getCategoryContent(cat).name} game"
					/>
				{/each}
			</span>
		{:else}
			<span class="subtle">–</span>
		{/if}
	</td>
	{#if showTokens}
		<td class="tokens"><TokenDisplay tokens={entry.tokens} /></td>
	{/if}
</tr>

<style>
	.row {
		position: relative;
		transition: background var(--t-fast) ease;
	}

	.row:hover {
		background: rgb(255 255 255 / 0.025);
	}

	td,
	th {
		padding: var(--sp-3) var(--sp-3);
		border-bottom: var(--border);
		vertical-align: middle;
		text-align: left;
		font-weight: inherit;
	}

	.rank {
		width: 3.5rem;
		padding-left: var(--sp-5);
		box-shadow: inset 3px 0 0 transparent;
	}

	.challenger .rank {
		box-shadow: inset 3px 0 0 var(--c-challenger);
	}

	.champion {
		background: linear-gradient(90deg, rgb(255 198 26 / 0.12), transparent 70%);
	}

	.champion .rank {
		box-shadow: inset 3px 0 0 var(--c-gold);
	}

	.rank-num {
		font-size: var(--fs-xl);
		font-weight: 700;
		color: var(--c-text-subtle);
	}

	.leader .rank-num {
		color: var(--c-gold);
		font-size: var(--fs-2xl);
		text-shadow: 0 0 18px rgb(255 198 26 / 0.45);
	}

	.player-cell {
		display: flex;
		align-items: center;
		gap: var(--sp-3);
		min-width: 0;
	}

	.who {
		display: grid;
		gap: 0.2rem;
		min-width: 0;
	}

	.clickable {
		cursor: pointer;
	}

	.name {
		justify-self: start;
		padding: 0;
		background: none;
		border: 0;
		color: inherit;
		text-align: left;
		cursor: pointer;
		font-family: var(--font-display);
		font-size: var(--fs-lg);
		font-weight: 700;
		text-decoration: none;
		letter-spacing: 0.02em;
		overflow-wrap: anywhere;
	}

	.name:hover {
		color: var(--c-gold-bright);
	}

	.leader .name {
		font-size: var(--fs-xl);
	}

	.meta {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.3rem;
	}

	.rookie {
		font-size: 0.65rem;
		text-transform: uppercase;
		letter-spacing: var(--tracking-wide);
		color: var(--c-live);
	}

	.points {
		width: 11rem;
	}

	.points-value {
		display: block;
		font-size: var(--fs-2xl);
		font-weight: 700;
		line-height: 1;
	}

	.leader .points-value {
		color: var(--c-gold-bright);
	}

	.bar {
		display: block;
		height: 4px;
		margin-top: 0.45rem;
		background: var(--c-surface-3);
		border-radius: 2px;
		overflow: hidden;
	}

	.fill {
		display: block;
		height: 100%;
		background: linear-gradient(90deg, var(--c-gold-deep), var(--c-gold));
		transition: width var(--t-slow) var(--ease-out);
	}

	.challenger .fill {
		background: linear-gradient(90deg, #c2401c, var(--c-challenger));
	}

	.to-go {
		display: block;
		margin-top: 0.3rem;
		font-size: 0.7rem;
		color: var(--c-text-subtle);
		white-space: nowrap;
	}

	.cat-wins {
		display: inline-flex;
		flex-wrap: wrap;
		gap: 0.25rem;
	}

	.wins-inline {
		display: none;
		gap: 0.2rem;
	}

	.tokens {
		white-space: nowrap;
		padding-right: var(--sp-5);
	}

	@media (max-width: 760px) {
		.wins {
			display: none;
		}

		.wins-inline {
			display: inline-flex;
		}

		.rank {
			padding-left: var(--sp-3);
			width: 2.5rem;
		}

		.points {
			width: 6.5rem;
		}

		.to-go {
			display: none;
		}

		.tokens {
			padding-right: var(--sp-3);
		}
	}

	@media (max-width: 480px) {
		.player-cell :global(.avatar) {
			display: none;
		}
		.tokens :global(.tokens) {
			flex-direction: column;
		}
	}
</style>
