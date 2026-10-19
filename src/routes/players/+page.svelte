<script lang="ts">
	import { resolve } from '$app/paths';
	import { getPlayers } from '#lib/data/client.ts';
	import { useResource } from '#lib/data/resource.svelte.ts';
	import DataView from '#lib/components/DataView.svelte';
	import PageTitle from '#lib/components/PageTitle.svelte';
	import PlayerAvatar from '#lib/components/PlayerAvatar.svelte';
	import LastUpdated from '#lib/components/LastUpdated.svelte';
	import { ordinal } from '#lib/format.ts';

	const resource = useResource(getPlayers);
</script>

<svelte:head>
	<title>Players · The Ultimate Gamer</title>
	<meta
		name="description"
		content="Everyone who has competed in The Ultimate Gamer, with titles, awards and all-time records."
	/>
</svelte:head>

<div class="container page">
	<PageTitle eyebrow="Roster" title="Players" lead="Everyone who has competed for the crown.">
		{#snippet actions()}
			{#if resource.status === 'success'}
				<LastUpdated
					generatedAt={resource.generatedAt}
					refreshing={resource.refreshing}
					error={resource.error}
				/>
			{/if}
		{/snippet}
	</PageTitle>

	<DataView
		{resource}
		isEmpty={(d) => d.players.length === 0}
		emptyTitle="No players yet"
		emptyMessage="No players have been published yet."
	>
		{#snippet children({ players })}
			{@const ranked = [...players].sort(
				(a, b) =>
					(b.ultimateGamerWins ?? 0) - (a.ultimateGamerWins ?? 0) ||
					(b.gameWins ?? 0) - (a.gameWins ?? 0) ||
					a.name.localeCompare(b.name)
			)}
			<ul class="players grid-cards">
				{#each players as p (p.slug)}
					{@const titles = p.ultimateGamerWins ?? 0}
					<li class="card" class:champ={titles > 0}>
						<div class="top">
							<PlayerAvatar
								name={p.name}
								initials={p.initials}
								avatarUrl={p.avatarUrl}
								size="lg"
								highlight={titles > 0 ? 'champion' : null}
							/>
							<div class="id">
								<h2><a href={resolve('/players/[slug]', { slug: p.slug })}>{p.name}</a></h2>
								{#if titles > 0}
									<p class="titles">
										<span aria-hidden="true">{'👑'.repeat(Math.min(titles, 5))}</span>
										{titles}× Ultimate Gamer
									</p>
								{:else if p.firstTournament}
									<p class="subtle since">Since {p.firstTournament.name}</p>
								{/if}
							</div>
						</div>
						<dl class="mini">
							<div>
								<dt>Played</dt>
								<dd class="num">{p.tournamentsPlayed ?? '–'}</dd>
							</div>
							<div>
								<dt>Game wins</dt>
								<dd class="num">{p.gameWins ?? '–'}</dd>
							</div>
							<div>
								<dt>Challenger</dt>
								<dd class="num">{p.challengerAppearances ?? '–'}</dd>
							</div>
							<div>
								<dt>Awards</dt>
								<dd class="num">{p.awardCount ?? '–'}</dd>
							</div>
							<div>
								<dt>Best finish</dt>
								<dd class="num">{p.bestPlacement ? ordinal(p.bestPlacement) : '–'}</dd>
							</div>
						</dl>
					</li>
				{/each}
			</ul>

			<section aria-labelledby="records-title">
				<h2 id="records-title" class="section-title">All-time records</h2>
				<div class="panel table-scroll">
					<table class="data-table">
						<caption class="visually-hidden"
							>All-time player records, sorted by titles then game wins</caption
						>
						<thead>
							<tr>
								<th scope="col">Player</th>
								<th scope="col">Titles</th>
								<th scope="col">Challenger</th>
								<th scope="col">Game wins</th>
								<th scope="col">Podiums</th>
								<th scope="col">Tournaments</th>
								<th scope="col">Awards</th>
							</tr>
						</thead>
						<tbody>
							{#each ranked as p (p.slug)}
								<tr>
									<th scope="row">
										<a class="player" href={resolve('/players/[slug]', { slug: p.slug })}>
											<PlayerAvatar
												name={p.name}
												initials={p.initials}
												avatarUrl={p.avatarUrl}
												size="sm"
											/>
											{p.name}
										</a>
									</th>
									<td class="num titles-cell">{p.ultimateGamerWins ?? '–'}</td>
									<td class="num">{p.challengerAppearances ?? '–'}</td>
									<td class="num">{p.gameWins ?? '–'}</td>
									<td class="num">{p.podiumFinishes ?? '–'}</td>
									<td class="num">{p.tournamentsPlayed ?? '–'}</td>
									<td class="num">{p.awardCount ?? '–'}</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			</section>
		{/snippet}
	</DataView>
</div>

<style>
	.players {
		list-style: none;
		margin: 0;
		padding: 0;
	}

	.card {
		position: relative;
		display: grid;
		gap: var(--sp-4);
		padding: var(--sp-4) var(--sp-5);
		background: var(--c-surface);
		border: var(--border);
		border-radius: var(--radius-lg);
		cursor: pointer;
		transition:
			border-color var(--t-base),
			transform var(--t-base) var(--ease-out);
	}

	.card:hover,
	.card:focus-within {
		border-color: var(--c-gold-line);
		transform: translateY(-2px);
	}

	.champ {
		background: linear-gradient(160deg, rgb(255 198 26 / 0.07), transparent 50%), var(--c-surface);
	}

	.top {
		display: flex;
		align-items: center;
		gap: var(--sp-3);
	}

	.id {
		flex: 1;
		min-width: 0;
	}

	h2 {
		font-size: var(--fs-xl);
		text-transform: uppercase;
		overflow-wrap: anywhere;
	}

	h2 a {
		text-decoration: none;
	}

	/* Make the whole card clickable while keeping a single link in the tab order. */
	h2 a::after {
		content: '';
		position: absolute;
		inset: 0;
		z-index: 1;
		border-radius: inherit;
	}

	.titles {
		font-size: var(--fs-xs);
		color: var(--c-gold);
		font-weight: 600;
	}

	.since {
		font-size: var(--fs-xs);
	}

	.mini {
		margin: 0;
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(4.25rem, 1fr));
		gap: var(--sp-3) var(--sp-2);
		border-top: var(--border);
		padding-top: var(--sp-3);
	}

	.mini div {
		display: grid;
		align-content: start;
		gap: 0.1rem;
		min-width: 0;
	}

	dt {
		font-size: 0.62rem;
		line-height: 1.2;
		text-transform: uppercase;
		letter-spacing: 0.04em;
		color: var(--c-text-subtle);
	}

	dd {
		margin: 0;
		font-weight: 700;
	}

	.section-title {
		font-size: var(--fs-xl);
		text-transform: uppercase;
		letter-spacing: var(--tracking-wide);
		margin-bottom: var(--sp-4);
	}

	.player {
		display: inline-flex;
		align-items: center;
		gap: var(--sp-2);
		font-weight: 600;
		text-decoration: none;
	}

	.titles-cell {
		color: var(--c-gold-bright);
		font-weight: 700;
	}
</style>
