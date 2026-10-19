<script lang="ts">
	import { resolve } from '$app/paths';
	import { siteConfig } from '#lib/config/site.ts';
	import { getSiteConfig } from '#lib/data/client.ts';
	import { useResource } from '#lib/data/resource.svelte.ts';
	import HowItWorks from '#lib/components/HowItWorks.svelte';

	// Only used to find the live tournament; the welcome copy renders without data.
	const site = useResource(getSiteConfig);
	const live = $derived(site.data?.currentTournament ?? null);
</script>

<svelte:head>
	<title>{siteConfig.name} · Multi-game LAN tournament</title>
</svelte:head>

<div class="container page home">
	<section class="hero" aria-labelledby="hero-title">
		<p class="eyebrow kicker">Welcome to</p>
		<h1 id="hero-title">
			<span class="the">The</span>
			<span class="ultimate">Ultimate Gamer</span>
		</h1>
		<p class="intro">
			A multi-game LAN tournament. Every game is from a different category, so no single skill
			carries you. Score points to become a <strong class="challenger">Challenger</strong>, then win
			one more game to be crowned the <strong class="gold">Ultimate Gamer</strong>.
		</p>

		<div class="actions">
			{#if live}
				<a class="btn btn-primary watch" href={resolve('/tournaments/[slug]', { slug: live.slug })}>
					<span class="dot" aria-hidden="true"></span>
					Watch the live tournament
					<span class="live-name">{live.name}</span>
				</a>
			{:else if site.status === 'loading'}
				<span class="btn-skeleton" aria-hidden="true"></span>
			{:else}
				<a class="btn btn-primary" href={resolve('/tournaments')}>See the tournaments</a>
			{/if}
			<a class="btn" href={resolve('/players')}>See the players</a>
			<a class="btn" href={resolve('/rules')}>How it works</a>
		</div>
	</section>

	<HowItWorks />
</div>

<style>
	.home {
		gap: var(--sp-7);
	}

	.hero {
		display: grid;
		gap: var(--sp-5);
		padding-top: var(--sp-6);
		max-width: 52rem;
	}

	.kicker {
		color: var(--c-gold);
		margin-bottom: calc(var(--sp-3) * -1);
	}

	h1 {
		display: grid;
		line-height: 0.88;
		text-transform: uppercase;
	}

	.the {
		font-size: calc(var(--fs-hero) * 0.32);
		letter-spacing: var(--tracking-wider);
		color: var(--c-text-muted);
	}

	.ultimate {
		font-size: var(--fs-hero);
		font-weight: 800;
		letter-spacing: -0.01em;
		background: linear-gradient(180deg, #fff 30%, #c9c9cf);
		-webkit-background-clip: text;
		background-clip: text;
		color: transparent;
		overflow-wrap: anywhere;
	}

	.ultimate::after {
		content: '';
		display: block;
		width: 4.5rem;
		height: 4px;
		margin-top: var(--sp-4);
		background: var(--c-gold);
		box-shadow: 0 0 24px var(--c-gold);
	}

	.intro {
		max-width: 60ch;
		font-size: var(--fs-lg);
		color: var(--c-text-muted);
	}

	.intro strong {
		color: var(--c-text);
	}

	.challenger {
		color: var(--c-challenger) !important;
	}

	.gold {
		color: var(--c-gold-bright) !important;
	}

	.actions {
		display: flex;
		flex-wrap: wrap;
		gap: var(--sp-3);
	}

	.watch {
		flex-wrap: wrap;
	}

	.live-name {
		font-family: var(--font-sans);
		font-weight: 600;
		text-transform: none;
		letter-spacing: normal;
		opacity: 0.75;
	}

	.dot {
		width: 0.55em;
		height: 0.55em;
		border-radius: 50%;
		background: currentColor;
		animation: ping 1.8s ease-out infinite;
	}

	.btn-skeleton {
		display: inline-block;
		width: 16rem;
		height: 2.4rem;
		border-radius: var(--radius-md);
		background: var(--c-surface-2);
	}

	@keyframes ping {
		from {
			box-shadow: 0 0 0 0 rgb(20 16 6 / 0.5);
		}
		to {
			box-shadow: 0 0 0 0.6em rgb(20 16 6 / 0);
		}
	}

	@media (max-width: 600px) {
		.actions .btn {
			width: 100%;
			justify-content: center;
		}
	}
</style>
