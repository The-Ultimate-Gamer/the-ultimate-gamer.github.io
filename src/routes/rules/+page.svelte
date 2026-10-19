<script lang="ts">
	import { resolve } from '$app/paths';
	import { getLeaderboard } from '#lib/data/client.ts';
	import { useResource } from '#lib/data/resource.svelte.ts';
	import { ordinal } from '#lib/format.ts';
	import PageTitle from '#lib/components/PageTitle.svelte';

	// Only used to show a real points table as an example; the rules themselves are static.
	const board = useResource(getLeaderboard);
	const example = $derived(board.data?.tournament ?? null);
	const pointsTable = $derived(
		[...(example?.pointsTable ?? [])].sort((a, b) => a.placement - b.placement)
	);

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
					finish, and points carry over from game to game for the whole tournament. Each tournament
					publishes its points per place on its page.
				</p>
				{#if example && pointsTable.length}
					<div class="callout points">
						<span class="eyebrow">Points per place in {example.name}</span>
						<ol class="points-table">
							{#each pointsTable as p (p.placement)}
								<li>
									<span class="subtle">{ordinal(p.placement)}</span>
									<strong class="num">{p.points}</strong>
								</li>
							{/each}
						</ol>
					</div>
				{/if}
				<p>
					On top of that, finishing ahead of your <a href="#nemeses">Nemesis</a> gives
					<strong>+1 point</strong>, and a <a href="#tokens">Double Down</a> token doubles everything
					you earn in that game.
				</p>
			</section>

			<section id="challenger">
				<h2><span class="num">02</span> Challenger status</h2>
				<p>
					Every tournament has a <strong>Challenger threshold</strong>. The moment your total
					reaches it, you become a <strong class="challenger">Challenger</strong>. Each tournament
					sets its own threshold, shown at the top of its standings.
				</p>
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
				<a class="btn" href={resolve('/games')}>Browse categories and games</a>
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
					Before each game, every player is assigned a random <strong>Nemesis</strong>. Finish ahead
					of your Nemesis and you earn <strong>+1 bonus point</strong>. After the game, new Nemeses
					are drawn.
				</p>
				<ul class="facts">
					<li>
						<strong>Nemeses are public.</strong> Everyone knows who their Nemesis is, and the pairs are
						shown with the next game on the tournament page.
					</li>
					<li>
						<strong>Each draw is independent.</strong> You never get yourself, but your Nemesis can have
						a different Nemesis of their own, and several players can share the same one.
					</li>
				</ul>
			</section>

			<section id="awards">
				<h2><span class="num">08</span> Awards</h2>
				<p>
					Awards celebrate everything beyond the crown: streaks, rivalries, comebacks and more.
					Recipients are decided by the organisers from the official results.
				</p>
				<a class="btn" href={resolve('/awards')}>See all awards and winners</a>
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

	.callout.points {
		border-color: var(--c-gold-line);
		background: var(--c-gold-soft);
	}

	.points-table {
		list-style: none;
		margin: var(--sp-2) 0 0;
		padding: 0;
		display: flex;
		flex-wrap: wrap;
		gap: var(--sp-2) var(--sp-5);
	}

	.points-table li {
		display: grid;
		justify-items: center;
	}

	.callout.points strong {
		color: var(--c-gold-bright);
	}

	.facts {
		margin: 0;
		padding-left: 1.25rem;
		display: grid;
		gap: var(--sp-2);
		color: var(--c-text-muted);
		max-width: 68ch;
	}

	.callout strong {
		font-size: var(--fs-xl);
		color: var(--c-challenger);
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
