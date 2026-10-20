<script lang="ts">
	import { resolve } from '$app/paths';
	import type { StandingEntry, TournamentDetail } from '#lib/data/types.ts';
	import { getAwardContent } from '#lib/content/awards.ts';
	import { tokenContent } from '#lib/content/tokens.ts';
	import { ordinal } from '#lib/format.ts';
	import PlayerAvatar from './PlayerAvatar.svelte';
	import StatusBadge from './StatusBadge.svelte';
	import CategoryBadge from './CategoryBadge.svelte';

	interface Props {
		entry: StandingEntry;
		tournament: TournamentDetail;
		/** Opens a game's full results. */
		onopengame: (gameNumber: number) => void;
	}

	let { entry, tournament, onopengame }: Props = $props();

	const slug = $derived(entry.player.slug);
	const status = $derived(
		entry.isChampion ? 'champion' : entry.isChallenger ? 'challenger' : 'contender'
	);
	const threshold = $derived(tournament.challengerThreshold);
	const progress = $derived(
		threshold && threshold > 0 ? Math.min(entry.points / threshold, 1) : null
	);
	const awards = $derived((tournament.awards ?? []).filter((a) => a.player.slug === slug));
	/** This player's result in every played game, in game order. */
	const games = $derived(
		[...tournament.games]
			.sort((a, b) => a.number - b.number)
			.flatMap((g) => {
				const result = g.results?.find((r) => r.player.slug === slug);
				return result ? [{ game: g, result }] : [];
			})
	);
	const wins = $derived(tournament.games.filter((g) => g.winner?.slug === slug));
	const tokens = $derived(
		entry.tokens
			? (['doubleDown', 'nominate'] as const).map((id) => ({
					...tokenContent[id],
					count: entry.tokens![id]
				}))
			: []
	);
</script>

<div class="head">
	<PlayerAvatar
		name={entry.player.name}
		avatarUrl={entry.player.avatarUrl}
		size="lg"
		highlight={status === 'contender' ? null : status}
	/>
	<div class="badges">
		<StatusBadge {status} />
		{#if entry.isFirstTournament}<span class="rookie">First tournament</span>{/if}
	</div>
</div>

<dl class="stats">
	<div>
		<dt>Rank</dt>
		<dd class="num">{ordinal(entry.rank)}</dd>
	</div>
	<div>
		<dt>Points</dt>
		<dd class="num gold">{entry.points}</dd>
	</div>
	<div>
		<dt>Games</dt>
		<dd class="num">{entry.gamesPlayed ?? games.length}</dd>
	</div>
	<div>
		<dt>Wins</dt>
		<dd class="num">{entry.gamesWon ?? wins.length}</dd>
	</div>
</dl>

{#if progress !== null}
	<section class="block" aria-labelledby="sd-challenger">
		<h3 class="eyebrow" id="sd-challenger">Road to the crown</h3>
		<span class="bar" class:done={entry.isChallenger || entry.isChampion} aria-hidden="true">
			<span class="fill" style:width="{progress * 100}%"></span>
		</span>
		<p class="muted">
			{#if entry.isChampion}
				{#if entry.challengerSinceGame}
					Reached Challenger in game <span class="num">#{entry.challengerSinceGame}</span>, then won
					one more to become the Ultimate Gamer.
				{:else}
					Became the Ultimate Gamer.
				{/if}
			{:else if entry.isChallenger}
				Challenger since game <span class="num">#{entry.challengerSinceGame ?? '–'}</span>. One more
				game win claims the crown.
			{:else}
				<span class="num">{Math.max((threshold ?? 0) - entry.points, 0)}</span> points to go before
				becoming a Challenger at <span class="num">{threshold}</span>.
			{/if}
		</p>
	</section>
{/if}

<section class="block" aria-labelledby="sd-awards">
	<h3 class="eyebrow" id="sd-awards">Awards</h3>
	{#if awards.length}
		<ul class="list">
			{#each awards as grant, i (`${grant.award}-${i}`)}
				{@const award = getAwardContent(grant.award)}
				<li class="award">
					<span class="icon" aria-hidden="true">{award.icon}</span>
					<span class="text">
						<span
							><strong>{award.name}</strong>{#if grant.detail}<span class="subtle">
									· {grant.detail}</span
								>{/if}</span
						>
						<span class="muted desc">{award.description}</span>
					</span>
				</li>
			{/each}
		</ul>
	{:else if entry.awards?.length}
		<!-- Fall back to the slugs on the standing when the tournament has no grant list. -->
		<ul class="list">
			{#each entry.awards as slug (slug)}
				{@const award = getAwardContent(slug)}
				<li class="award">
					<span class="icon" aria-hidden="true">{award.icon}</span>
					<span class="text">
						<strong>{award.name}</strong>
						<span class="muted desc">{award.description}</span>
					</span>
				</li>
			{/each}
		</ul>
	{:else}
		<p class="subtle">No awards in this tournament yet.</p>
	{/if}
</section>

<section class="block" aria-labelledby="sd-cats">
	<h3 class="eyebrow" id="sd-cats">Category wins</h3>
	{#if wins.length}
		<ul class="list">
			{#each wins as g (g.number)}
				<li class="win">
					<CategoryBadge slug={g.category} />
					<button class="link" type="button" onclick={() => onopengame(g.number)}>
						{g.game.name} <span class="subtle num">#{g.number}</span>
					</button>
				</li>
			{/each}
		</ul>
	{:else}
		<p class="subtle">No games won yet.</p>
	{/if}
</section>

{#if tokens.length}
	<section class="block" aria-labelledby="sd-tokens">
		<h3 class="eyebrow" id="sd-tokens">Tokens left</h3>
		<ul class="list">
			{#each tokens as t (t.key)}
				<li class="token-row" class:spent={t.count <= 0}>
					<span class="token num">{t.key}×{t.count}</span>
					<span class="text">
						<span
							><strong>{t.name}</strong>
							<span class="subtle">· {t.count > 0 ? `${t.count} left` : 'used'}</span></span
						>
						<span class="muted desc">{t.description}</span>
					</span>
				</li>
			{/each}
		</ul>
	</section>
{/if}

{#if games.length}
	<section class="block" aria-labelledby="sd-games">
		<h3 class="eyebrow" id="sd-games">Game by game</h3>
		<div class="table-scroll">
			<table class="data-table">
				<caption class="visually-hidden">{entry.player.name}’s games in {tournament.name}</caption>
				<thead>
					<tr>
						<th scope="col">Game</th>
						<th scope="col">Place</th>
						<th scope="col">Points</th>
					</tr>
				</thead>
				<tbody>
					{#each games as { game, result } (game.number)}
						<tr class:won={result.placement === 1}>
							<th scope="row">
								<button class="link" type="button" onclick={() => onopengame(game.number)}
									>{game.game.name}</button
								>
								<span class="game-meta">
									<span class="subtle num">#{game.number}</span>
									<CategoryBadge slug={game.category} size="sm" iconOnly />
									{#if result.doubleDown}<span class="note dd">Double Down</span>{/if}
									{#if result.nemesis}
										{#if result.defeatedNemesis}
											<span class="note nem">Beat Nemesis {result.nemesis.name}</span>
										{:else}
											<span class="subtle">Nemesis: {result.nemesis.name}</span>
										{/if}
									{/if}
								</span>
							</th>
							<td class="num place">{ordinal(result.placement)}</td>
							<td class="num">+{result.points}</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</section>
{/if}

<a class="btn btn-primary profile" href={resolve('/players/[slug]', { slug })}>
	Open {entry.player.name}’s profile <span aria-hidden="true">→</span>
</a>

<style>
	.head {
		display: flex;
		align-items: center;
		gap: var(--sp-4);
	}

	.badges {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: var(--sp-2);
	}

	.rookie {
		font-size: 0.7rem;
		text-transform: uppercase;
		letter-spacing: var(--tracking-wide);
		color: var(--c-live);
	}

	.stats {
		margin: 0;
		display: grid;
		grid-template-columns: repeat(4, minmax(0, 1fr));
		gap: var(--sp-2);
	}

	.stats div {
		display: grid;
		gap: 0.15rem;
		padding: var(--sp-3);
		background: var(--c-surface);
		border: var(--border);
		border-radius: var(--radius-md);
	}

	dt {
		font-size: 0.65rem;
		text-transform: uppercase;
		letter-spacing: var(--tracking-wide);
		color: var(--c-text-subtle);
	}

	dd {
		margin: 0;
		font-size: var(--fs-xl);
		font-weight: 700;
	}

	.gold {
		color: var(--c-gold-bright);
	}

	.block {
		display: grid;
		gap: var(--sp-3);
	}

	.block > p {
		font-size: var(--fs-sm);
	}

	.bar {
		display: block;
		height: 6px;
		background: var(--c-surface-3);
		border-radius: 3px;
		overflow: hidden;
	}

	.fill {
		display: block;
		height: 100%;
		background: linear-gradient(90deg, var(--c-gold-deep), var(--c-gold));
	}

	.done .fill {
		background: linear-gradient(90deg, #c2401c, var(--c-challenger));
	}

	.list {
		list-style: none;
		margin: 0;
		padding: 0;
		display: grid;
		gap: var(--sp-3);
		font-size: var(--fs-sm);
	}

	.award,
	.token-row {
		display: grid;
		grid-template-columns: 2.5rem minmax(0, 1fr);
		align-items: start;
		gap: var(--sp-3);
	}

	.icon {
		display: grid;
		place-items: center;
		width: 2.5rem;
		height: 2.5rem;
		font-size: 1.25rem;
		background: var(--c-surface);
		border: var(--border-strong);
		border-radius: var(--radius-md);
	}

	.text {
		display: grid;
		gap: 0.1rem;
	}

	.desc {
		font-size: var(--fs-xs);
	}

	.token {
		display: grid;
		place-items: center;
		height: 2.5rem;
		border-radius: var(--radius-md);
		border: 1px solid var(--c-gold-line);
		background: var(--c-gold-soft);
		color: var(--c-gold-bright);
		font-size: var(--fs-xs);
		font-weight: 700;
	}

	.spent .token {
		border-color: var(--c-border);
		background: transparent;
		color: var(--c-text-subtle);
		text-decoration: line-through;
	}

	.win {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: var(--sp-2);
	}

	.link {
		padding: 0;
		background: none;
		border: 0;
		font-weight: 600;
		text-align: left;
		cursor: pointer;
	}

	.link:hover {
		color: var(--c-gold-bright);
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

	.profile {
		justify-self: start;
	}

	@media (max-width: 420px) {
		.stats {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}
	}
</style>
