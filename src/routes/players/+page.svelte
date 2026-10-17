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
		content="Everyone who has competed in The Ultimate Gamer, with titles, awards and statistics."
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
							{#if p.current}
								<div class="current" title="Current tournament: {p.current.tournament.name}">
									<span class="num rank">{ordinal(p.current.rank)}</span>
									<span class="num subtle">{p.current.points} pts</span>
								</div>
							{/if}
						</div>
						<dl class="mini">
							<div>
								<dt>Tournaments</dt>
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
								<dt>Best</dt>
								<dd class="num">{p.bestPlacement ? ordinal(p.bestPlacement) : '–'}</dd>
							</div>
						</dl>
					</li>
				{/each}
			</ul>
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

	h2 a::after {
		content: '';
		position: absolute;
		inset: 0;
	}

	.titles {
		font-size: var(--fs-xs);
		color: var(--c-gold);
		font-weight: 600;
	}

	.since {
		font-size: var(--fs-xs);
	}

	.current {
		display: grid;
		justify-items: end;
		font-size: var(--fs-xs);
	}

	.rank {
		font-size: var(--fs-lg);
		font-weight: 700;
	}

	.mini {
		margin: 0;
		display: grid;
		grid-template-columns: repeat(5, 1fr);
		gap: var(--sp-2);
		border-top: var(--border);
		padding-top: var(--sp-3);
	}

	.mini div {
		display: grid;
		gap: 0.1rem;
		min-width: 0;
	}

	dt {
		font-size: 0.6rem;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		color: var(--c-text-subtle);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	dd {
		margin: 0;
		font-weight: 700;
	}
</style>
