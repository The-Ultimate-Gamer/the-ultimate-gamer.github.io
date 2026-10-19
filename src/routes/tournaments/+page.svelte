<script lang="ts">
	import PageMeta from '#lib/components/PageMeta.svelte';
	import { resolve } from '$app/paths';
	import { getTournaments } from '#lib/data/client.ts';
	import { useResource } from '#lib/data/resource.svelte.ts';
	import { formatDateRange } from '#lib/format.ts';
	import DataView from '#lib/components/DataView.svelte';
	import PageTitle from '#lib/components/PageTitle.svelte';
	import TournamentCard from '#lib/components/TournamentCard.svelte';
	import PlayerAvatar from '#lib/components/PlayerAvatar.svelte';
	import LastUpdated from '#lib/components/LastUpdated.svelte';

	const resource = useResource(getTournaments);

	const order = { ongoing: 0, upcoming: 1, completed: 2 } as const;
	function sorted<T extends { status: keyof typeof order; startDate?: string | null }>(list: T[]) {
		return [...list].sort(
			(a, b) =>
				order[a.status] - order[b.status] || (b.startDate ?? '').localeCompare(a.startDate ?? '')
		);
	}
</script>

<PageMeta
	title="Tournaments"
	description="Every edition of The Ultimate Gamer LAN tournament: live standings, champions and results."
/>

<div class="container page">
	<PageTitle
		eyebrow="Archive"
		title="Tournaments"
		lead="Every edition of The Ultimate Gamer. Open one for its standings, schedule and results."
	>
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
		isEmpty={(d) => d.tournaments.length === 0}
		emptyTitle="No tournaments yet"
		emptyMessage="No tournaments have been published yet."
	>
		{#snippet children({ tournaments })}
			<div class="grid-cards">
				{#each sorted(tournaments) as tournament (tournament.slug)}
					<TournamentCard {tournament} />
				{/each}
			</div>

			<section aria-labelledby="champs-title">
				<h2 id="champs-title" class="section-title">Hall of champions</h2>
				<ol class="timeline">
					{#each [...tournaments].sort( (a, b) => (b.startDate ?? '').localeCompare(a.startDate ?? '') ) as t (t.slug)}
						<li class:has-champ={t.champion}>
							<span class="date subtle">{formatDateRange(t.startDate, t.endDate)}</span>
							<a class="t-name" href={resolve('/tournaments/[slug]', { slug: t.slug })}>{t.name}</a>
							{#if t.champion}
								<a class="champ" href={resolve('/players/[slug]', { slug: t.champion.slug })}>
									<PlayerAvatar
										name={t.champion.name}
										avatarUrl={t.champion.avatarUrl}
										size="sm"
										highlight="champion"
									/>
									<span><span aria-hidden="true">👑</span> {t.champion.name}</span>
								</a>
							{:else}
								<span class="subtle">
									{t.status === 'completed' ? 'Champion not recorded' : 'Crown still up for grabs'}
								</span>
							{/if}
						</li>
					{/each}
				</ol>
			</section>
		{/snippet}
	</DataView>
</div>

<style>
	.section-title {
		font-size: var(--fs-xl);
		text-transform: uppercase;
		letter-spacing: var(--tracking-wide);
		margin-bottom: var(--sp-4);
	}

	.timeline {
		list-style: none;
		margin: 0;
		padding: 0;
		display: grid;
		border-left: 2px solid var(--c-border-strong);
	}

	.timeline li {
		position: relative;
		display: grid;
		grid-template-columns: 12rem minmax(0, 1fr) auto;
		align-items: center;
		gap: var(--sp-2) var(--sp-4);
		padding: var(--sp-3) var(--sp-5);
	}

	.timeline li::before {
		content: '';
		position: absolute;
		left: -7px;
		top: calc(50% - 6px);
		width: 12px;
		height: 12px;
		border-radius: 50%;
		background: var(--c-bg);
		border: 2px solid var(--c-border-strong);
	}

	.timeline li.has-champ::before {
		background: var(--c-gold);
		border-color: var(--c-gold);
		box-shadow: 0 0 12px var(--c-gold);
	}

	.date {
		font-size: var(--fs-xs);
	}

	.t-name {
		font-family: var(--font-display);
		font-size: var(--fs-lg);
		font-weight: 700;
		text-transform: uppercase;
		text-decoration: none;
		overflow-wrap: anywhere;
	}

	.champ {
		display: inline-flex;
		align-items: center;
		gap: var(--sp-2);
		font-weight: 700;
		color: var(--c-gold-bright);
		text-decoration: none;
	}

	@media (max-width: 640px) {
		.timeline li {
			grid-template-columns: minmax(0, 1fr);
			gap: var(--sp-1);
		}
	}
</style>
