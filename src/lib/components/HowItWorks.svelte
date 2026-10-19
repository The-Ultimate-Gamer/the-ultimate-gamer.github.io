<script lang="ts">
	import { resolve } from '$app/paths';

	interface Props {
		/** Active tournament threshold; omitted when unknown so no value is invented. */
		threshold?: number | null;
	}

	let { threshold }: Props = $props();
</script>

<section class="how" aria-labelledby="how-heading">
	<h2 id="how-heading" class="eyebrow">How to win</h2>
	<ol>
		<li>
			<span class="step num">01</span>
			<p class="title">Score points</p>
			<p class="muted">Every game awards points. Finish ahead of your Nemesis for a bonus point.</p>
		</li>
		<li>
			<span class="step num">02</span>
			<p class="title">Become a Challenger</p>
			<p class="muted">
				Reach {#if threshold}<strong class="num">{threshold}</strong> points{:else}the threshold{/if}
				to become a Challenger. It doesn’t win the tournament on its own.
			</p>
		</li>
		<li>
			<span class="step num">03</span>
			<p class="title">Win as a Challenger</p>
			<p class="muted">
				A Challenger who wins any following game is crowned the Ultimate Gamer — instantly.
			</p>
		</li>
	</ol>
	<a class="more" href={resolve('/rules')}>Full rules →</a>
</section>

<style>
	.how {
		display: grid;
		gap: var(--sp-4);
	}

	h2 {
		color: var(--c-gold);
	}

	ol {
		list-style: none;
		margin: 0;
		padding: 0;
		display: grid;
		gap: var(--sp-4);
		grid-template-columns: repeat(auto-fit, minmax(min(100%, 16rem), 1fr));
	}

	li {
		display: grid;
		gap: var(--sp-1);
		padding: var(--sp-4) var(--sp-5);
		border-left: 2px solid var(--c-border-strong);
	}

	li:last-child {
		border-left-color: var(--c-gold);
	}

	.step {
		font-size: var(--fs-xs);
		color: var(--c-gold);
		font-weight: 700;
	}

	.title {
		font-family: var(--font-display);
		font-size: var(--fs-lg);
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: var(--tracking-wide);
	}

	.muted {
		font-size: var(--fs-sm);
	}

	strong {
		color: var(--c-text);
	}

	.more {
		justify-self: start;
		font-size: var(--fs-sm);
		font-weight: 600;
		color: var(--c-gold);
		text-decoration: none;
	}
</style>
