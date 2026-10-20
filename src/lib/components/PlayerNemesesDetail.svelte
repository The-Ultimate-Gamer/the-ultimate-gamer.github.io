<script lang="ts">
	import { resolve } from '$app/paths';
	import type { PlayerProfile } from '#lib/data/types.ts';
	import { ordinal } from '#lib/format.ts';

	interface Props {
		player: PlayerProfile;
		/** Limit to one tournament. */
		tournament?: string | null;
	}

	let { player: p, tournament = null }: Props = $props();

	/** Games in which this player had a Nemesis, newest first as published. */
	const games = $derived(
		(p.matches ?? []).filter((m) => m.nemesis && (!tournament || m.tournament.slug === tournament))
	);
	const beaten = $derived(games.filter((m) => m.defeatedNemesis).length);
</script>

<div class="nemeses">
	{#if !tournament && p.nemesis}
		<p class="summary">
			Beat their Nemesis
			<strong class="num">{p.nemesis.defeated}</strong>
			{#if p.nemesis.timesAssigned}of <strong class="num">{p.nemesis.timesAssigned}</strong>{/if}
			times. Beaten <strong class="num">{p.nemesis.defeatedBy}</strong>
			{p.nemesis.defeatedBy === 1 ? 'time' : 'times'} as someone else’s Nemesis.
		</p>
	{:else if tournament && games.length}
		<p class="summary">
			Beat their Nemesis in <strong class="num">{beaten}</strong> of
			<strong class="num">{games.length}</strong> games.
		</p>
	{/if}

	{#if !tournament && p.rivals?.length}
		<section class="block" aria-labelledby="nem-rivals">
			<h3 class="eyebrow" id="nem-rivals">Rivalries</h3>
			<ul class="rivals">
				{#each p.rivals as r (r.player.slug)}
					{@const total = r.nemesisWins + r.nemesisLosses}
					<li>
						<a href={resolve('/players/[slug]', { slug: r.player.slug })}>{r.player.name}</a>
						<span class="score num" title="Beat them as their Nemesis · beaten by them as theirs"
							><span class="w">{r.nemesisWins}</span>–<span class="l">{r.nemesisLosses}</span></span
						>
						{#if total}
							<span class="bar" aria-hidden="true">
								<span class="fill" style:width="{(r.nemesisWins / total) * 100}%"></span>
							</span>
						{/if}
					</li>
				{/each}
			</ul>
			<p class="subtle hint">
				Left: times {p.name} finished ahead of them as their Nemesis. Right: the other way around.
			</p>
		</section>
	{/if}

	{#if games.length}
		<section class="block" aria-labelledby="nem-games">
			<h3 class="eyebrow" id="nem-games">Nemesis games</h3>
			<ul class="games">
				{#each games as m (`${m.tournament.slug}-${m.gameNumber}`)}
					<li class:beat={m.defeatedNemesis}>
						<span class="result">{m.defeatedNemesis ? 'Beat' : 'Lost to'}</span>
						<a href={resolve('/players/[slug]', { slug: m.nemesis!.slug })}>{m.nemesis!.name}</a>
						<span class="subtle">
							in
							<a
								href="{resolve('/tournaments/[slug]', {
									slug: m.tournament.slug
								})}#game-{m.gameNumber}">{m.game.name}</a
							>
							· {[ordinal(m.placement), tournament ? null : m.tournament.name]
								.filter(Boolean)
								.join(' · ')}
						</span>
					</li>
				{/each}
			</ul>
		</section>
	{:else if !(p.rivals?.length && !tournament)}
		<p class="subtle">No Nemesis games {tournament ? 'in this tournament' : 'yet'}.</p>
	{/if}
</div>

<style>
	.nemeses {
		display: grid;
		gap: var(--sp-5);
	}

	.summary {
		font-size: var(--fs-sm);
		color: var(--c-text-muted);
	}

	.summary strong {
		color: var(--c-text);
	}

	.block {
		display: grid;
		gap: var(--sp-3);
	}

	.rivals,
	.games {
		list-style: none;
		margin: 0;
		padding: 0;
		display: grid;
		gap: var(--sp-2);
		font-size: var(--fs-sm);
	}

	.rivals li {
		display: grid;
		grid-template-columns: minmax(0, 1fr) 3.5rem 6rem;
		align-items: center;
		gap: var(--sp-3);
	}

	a {
		font-weight: 600;
		text-decoration: none;
	}

	.score {
		text-align: right;
		font-weight: 700;
	}

	.w {
		color: var(--c-live);
	}

	.l {
		color: var(--c-challenger);
	}

	.bar {
		height: 6px;
		border-radius: 3px;
		background: var(--c-challenger-soft);
		overflow: hidden;
	}

	.fill {
		display: block;
		height: 100%;
		background: var(--c-live);
	}

	.hint {
		font-size: var(--fs-xs);
	}

	.games li {
		display: flex;
		flex-wrap: wrap;
		align-items: baseline;
		gap: 0.3rem;
	}

	.games .subtle {
		font-size: var(--fs-xs);
	}

	.games .subtle a {
		font-weight: 500;
		color: var(--c-text-muted);
	}

	.result {
		min-width: 3.75rem;
		font-size: var(--fs-xs);
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: var(--tracking-wide);
		color: var(--c-text-subtle);
	}

	.beat .result {
		color: var(--c-live);
	}
</style>
