<script lang="ts">
	import { resolve } from '$app/paths';
	import { getLeaderboard } from '#lib/data/client.ts';
	import { useResource } from '#lib/data/resource.svelte.ts';
	import { categoryContent } from '#lib/content/categories.ts';
	import { awardContent } from '#lib/content/awards.ts';
	import PageTitle from '#lib/components/PageTitle.svelte';

	// Only used to show the live threshold; the rules themselves are static.
	const board = useResource(getLeaderboard);
	const live = $derived(board.data?.tournament ?? null);

	const sections = [
		{ id: 'points', title: 'Points' },
		{ id: 'challenger', title: 'Challenger status' },
		{ id: 'winning', title: 'How to win' },
		{ id: 'categories', title: 'Game categories' },
		{ id: 'selection', title: 'Game selection' },
		{ id: 'tokens', title: 'Player tokens' },
		{ id: 'nemeses', title: 'Nemeses' },
		{ id: 'awards', title: 'Awards' }
	];
</script>

<svelte:head>
	<title>Rules · The Ultimate Gamer</title>
	<meta
		name="description"
		content="How The Ultimate Gamer works: points, Challenger status, categories, game selection, tokens, Nemeses and awards."
	/>
</svelte:head>

<div class="container page">
	<PageTitle
		eyebrow="How it works"
		title="Rules"
		lead="New to the LAN? Everything you need to know fits on this page. Points get you close — but only a win can crown you."
	/>

	<div class="layout">
		<nav class="toc" aria-label="On this page">
			<ol>
				{#each sections as s, i (s.id)}
					<li>
						<a href="#{s.id}"><span class="num">{String(i + 1).padStart(2, '0')}</span> {s.title}</a
						>
					</li>
				{/each}
			</ol>
		</nav>

		<article class="rules">
			<section id="points">
				<h2><span class="num">01</span> Points</h2>
				<p>
					Everyone starts at <strong>zero</strong>. Each game awards points based on where you
					finish — the better your result, the more points you earn. Points carry over from game to
					game for the whole tournament.
				</p>
			</section>

			<section id="challenger">
				<h2><span class="num">02</span> Challenger status</h2>
				<p>
					Every tournament has a <strong>Challenger threshold</strong>. The moment your total
					reaches it, you become a <strong class="challenger">Challenger</strong>.
				</p>
				{#if live?.challengerThreshold != null}
					<p class="callout">
						<span class="eyebrow">{live.name}</span>
						Challenger threshold: <strong class="num">{live.challengerThreshold}</strong> points
					</p>
				{/if}
				<p>
					Becoming a Challenger does <em>not</em> win you the tournament. More than one player can be
					a Challenger at the same time, and you stay a Challenger until the tournament ends.
				</p>
			</section>

			<section id="winning">
				<h2><span class="num">03</span> How to win</h2>
				<p>
					A Challenger who <strong>wins any game after becoming a Challenger</strong> is instantly
					crowned the <strong class="gold">Ultimate Gamer</strong>, and the tournament ends right
					there.
				</p>
				<p>
					If someone who is not a Challenger wins the game instead, play continues. That means the
					champion isn’t always the player with the most points — and that’s the point.
				</p>
			</section>

			<section id="categories">
				<h2><span class="num">04</span> Game categories</h2>
				<p>
					Games are played one category at a time. The category is known before the game itself is
					revealed. Organisers may set the order, put it to a vote or randomise it — and a
					tournament doesn’t have to use every category.
				</p>
				<ul class="cat-grid">
					{#each categoryContent as c (c.slug)}
						<li style:--accent="var(--cat-{c.slug})">
							<span class="cat-icon" aria-hidden="true">{c.icon}</span>
							<span class="cat-name">{c.name}</span>
							<span class="cat-blurb subtle">{c.blurb}</span>
						</li>
					{/each}
				</ul>
			</section>

			<section id="selection">
				<h2><span class="num">05</span> Game selection</h2>
				<ol class="steps">
					<li>The winner of the previous game nominates one game for the next category.</li>
					<li>The other players vote for another game.</li>
					<li>Anyone can spend a <strong>Nominate</strong> token to add one more nomination.</li>
					<li>All eligible nominations go into a random draw, and one game is picked.</li>
				</ol>
				<p class="subtle">
					Winning gives you influence over what comes next — not a guarantee. The draw is recorded
					and published with the results.
				</p>
			</section>

			<section id="tokens">
				<h2><span class="num">06</span> Player tokens</h2>
				<p>Every player starts with two single-use tokens.</p>
				<div class="tokens">
					<div class="token">
						<p class="token-name">Double Down <span class="num">×1</span></p>
						<p class="muted">
							Play it <em>before</em> a game to double every point you earn in that game — including the
							Nemesis bonus.
						</p>
					</div>
					<div class="token">
						<p class="token-name">Nominate <span class="num">×1</span></p>
						<p class="muted">Add one extra game to the nominations for the next draw.</p>
					</div>
				</div>
				<p class="subtle">
					Once used, a token is gone. Remaining tokens are shown on the leaderboard.
				</p>
			</section>

			<section id="nemeses">
				<h2><span class="num">07</span> Nemeses</h2>
				<p>
					Before each game, every player is secretly assigned a random <strong>Nemesis</strong> —
					never themselves. Finish ahead of your Nemesis and you earn
					<strong>+1 bonus point</strong>. After the game, new Nemeses are drawn.
				</p>
			</section>

			<section id="awards">
				<h2><span class="num">08</span> Awards</h2>
				<p>
					Awards celebrate everything beyond the crown. Recipients are decided from the official
					results.
				</p>
				<ul class="award-list">
					{#each awardContent as a (a.slug)}
						<li>
							<span aria-hidden="true">{a.icon}</span>
							<strong>{a.name}</strong>
							<span class="muted">{a.description}</span>
						</li>
					{/each}
				</ul>
				<a class="btn" href={resolve('/awards')}>See award winners</a>
			</section>
		</article>
	</div>
</div>

<style>
	.layout {
		display: grid;
		grid-template-columns: 14rem minmax(0, 1fr);
		gap: var(--sp-7);
		align-items: start;
	}

	.toc {
		position: sticky;
		top: 5.5rem;
	}

	.toc ol {
		list-style: none;
		margin: 0;
		padding: 0;
		display: grid;
		gap: 0.15rem;
		border-left: var(--border);
	}

	.toc a {
		display: block;
		padding: 0.35rem var(--sp-3);
		font-size: var(--fs-sm);
		color: var(--c-text-muted);
		text-decoration: none;
		border-left: 2px solid transparent;
		margin-left: -1px;
	}

	.toc a:hover {
		color: var(--c-text);
		border-left-color: var(--c-gold);
	}

	.toc .num {
		color: var(--c-text-subtle);
		font-size: var(--fs-xs);
		margin-right: 0.3rem;
	}

	.rules {
		display: grid;
		gap: var(--sp-7);
		max-width: 52rem;
	}

	section {
		display: grid;
		gap: var(--sp-4);
		scroll-margin-top: 5.5rem;
	}

	h2 {
		font-size: var(--fs-2xl);
		text-transform: uppercase;
		display: flex;
		align-items: baseline;
		gap: var(--sp-3);
	}

	h2 .num {
		font-size: var(--fs-sm);
		color: var(--c-gold);
	}

	p {
		color: var(--c-text-muted);
		max-width: 68ch;
	}

	strong {
		color: var(--c-text);
	}

	.challenger {
		color: var(--c-challenger);
	}

	.gold {
		color: var(--c-gold-bright);
	}

	.callout {
		display: grid;
		gap: 0.2rem;
		padding: var(--sp-4) var(--sp-5);
		border: 1px solid rgb(255 106 61 / 0.4);
		background: var(--c-challenger-soft);
		border-radius: var(--radius-md);
		color: var(--c-text);
	}

	.callout strong {
		font-size: var(--fs-xl);
		color: var(--c-challenger);
	}

	.cat-grid {
		list-style: none;
		margin: 0;
		padding: 0;
		display: grid;
		gap: var(--sp-2);
		grid-template-columns: repeat(auto-fill, minmax(min(100%, 15rem), 1fr));
	}

	.cat-grid li {
		display: grid;
		grid-template-columns: auto 1fr;
		gap: 0 var(--sp-3);
		padding: var(--sp-3);
		background: var(--c-surface);
		border: var(--border);
		border-left: 3px solid var(--accent, var(--c-gold));
		border-radius: var(--radius-md);
	}

	.cat-icon {
		grid-row: span 2;
		font-size: 1.3rem;
	}

	.cat-name {
		font-family: var(--font-display);
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: var(--tracking-wide);
		font-size: var(--fs-sm);
	}

	.cat-blurb {
		font-size: var(--fs-xs);
	}

	.steps {
		margin: 0;
		padding-left: 1.25rem;
		display: grid;
		gap: var(--sp-2);
		color: var(--c-text-muted);
	}

	.steps li::marker {
		color: var(--c-gold);
		font-family: var(--font-mono);
		font-weight: 700;
	}

	.tokens {
		display: grid;
		gap: var(--sp-3);
		grid-template-columns: repeat(auto-fit, minmax(min(100%, 16rem), 1fr));
	}

	.token {
		padding: var(--sp-4);
		border: 1px solid var(--c-gold-line);
		background: var(--c-gold-soft);
		border-radius: var(--radius-md);
		display: grid;
		gap: var(--sp-1);
	}

	.token-name {
		font-family: var(--font-display);
		font-weight: 800;
		text-transform: uppercase;
		letter-spacing: var(--tracking-wide);
		color: var(--c-gold-bright);
	}

	.award-list {
		list-style: none;
		margin: 0;
		padding: 0;
		display: grid;
		gap: var(--sp-2);
		font-size: var(--fs-sm);
	}

	.award-list li {
		display: flex;
		flex-wrap: wrap;
		gap: 0 var(--sp-2);
	}

	.btn {
		justify-self: start;
	}

	@media (max-width: 900px) {
		.layout {
			grid-template-columns: minmax(0, 1fr);
			gap: var(--sp-5);
		}

		.toc {
			position: static;
		}

		.toc ol {
			grid-template-columns: repeat(auto-fill, minmax(10rem, 1fr));
		}
	}
</style>
