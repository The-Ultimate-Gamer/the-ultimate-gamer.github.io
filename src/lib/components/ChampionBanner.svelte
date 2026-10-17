<script lang="ts">
	import { resolve } from '$app/paths';
	import type { GameResult, StandingEntry } from '#lib/data/types.ts';
	import PlayerAvatar from './PlayerAvatar.svelte';

	interface Props {
		champion: StandingEntry;
		tournamentName: string;
		decidingGame?: GameResult | null;
	}

	let { champion, tournamentName, decidingGame }: Props = $props();
</script>

<section class="champion" aria-labelledby="champion-heading">
	<div class="glow" aria-hidden="true"></div>
	<PlayerAvatar name={champion.player.name} size="xl" highlight="champion" />
	<div class="text">
		<p class="eyebrow"><span aria-hidden="true">👑</span> {tournamentName} · Champion</p>
		<h2 id="champion-heading">
			<a href={resolve('/players/[slug]', { slug: champion.player.slug })}>{champion.player.name}</a
			>
			<span class="title">is the Ultimate Gamer</span>
		</h2>
		<p class="facts">
			<span><span class="num">{champion.points}</span> pts</span>
			<span>Finished <span class="num">#{champion.rank}</span> in points</span>
			{#if decidingGame}
				<span
					>Decided in game <span class="num">#{decidingGame.number}</span> · {decidingGame.game
						.name}</span
				>
			{/if}
		</p>
		{#if champion.rank !== 1}
			<p class="note">Points don’t crown the champion — winning a game as a Challenger does.</p>
		{/if}
	</div>
</section>

<style>
	.champion {
		position: relative;
		overflow: hidden;
		display: flex;
		align-items: center;
		gap: var(--sp-5);
		padding: var(--sp-5) var(--sp-6);
		border: 1px solid var(--c-gold-line);
		border-radius: var(--radius-lg);
		background:
			linear-gradient(110deg, rgb(255 198 26 / 0.16), rgb(255 198 26 / 0.02) 55%), var(--c-surface);
		box-shadow: var(--glow-gold);
	}

	.glow {
		position: absolute;
		inset: -40% -10% auto auto;
		width: 24rem;
		height: 24rem;
		background: radial-gradient(circle, rgb(255 198 26 / 0.18), transparent 65%);
		pointer-events: none;
	}

	.text {
		position: relative;
		display: grid;
		gap: var(--sp-2);
		min-width: 0;
	}

	.eyebrow {
		color: var(--c-gold);
	}

	h2 {
		font-size: var(--fs-3xl);
		text-transform: uppercase;
		display: flex;
		flex-wrap: wrap;
		align-items: baseline;
		gap: 0 var(--sp-3);
	}

	h2 a {
		color: var(--c-gold-bright);
		text-decoration: none;
		text-shadow: 0 0 30px rgb(255 198 26 / 0.35);
	}

	.title {
		font-size: 0.5em;
		color: var(--c-text);
		letter-spacing: var(--tracking-wide);
	}

	.facts {
		display: flex;
		flex-wrap: wrap;
		gap: var(--sp-1) var(--sp-5);
		font-size: var(--fs-sm);
		color: var(--c-text-muted);
	}

	.note {
		font-size: var(--fs-sm);
		color: var(--c-text-muted);
		font-style: italic;
	}

	@media (max-width: 600px) {
		.champion {
			flex-direction: column;
			align-items: flex-start;
			padding: var(--sp-5);
		}
	}
</style>
