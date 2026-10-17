<script lang="ts">
	import { resolve } from '$app/paths';
	import { getAwards } from '#lib/data/client.ts';
	import { useResource } from '#lib/data/resource.svelte.ts';
	import { awardContent } from '#lib/content/awards.ts';
	import PageTitle from '#lib/components/PageTitle.svelte';
	import ErrorState from '#lib/components/ErrorState.svelte';
	import LastUpdated from '#lib/components/LastUpdated.svelte';
	import type { AwardDefinition } from '#lib/data/types.ts';

	const awards = useResource(getAwards);

	const fromData = $derived(new Map((awards.data?.awards ?? []).map((a) => [a.slug, a])));

	// Static copy renders immediately; awards only present in data are appended.
	const gallery = $derived([
		...awardContent.map((a) => ({ ...a, data: fromData.get(a.slug) })),
		...(awards.data?.awards ?? [])
			.filter((a) => !awardContent.some((s) => s.slug === a.slug))
			.map((a: AwardDefinition) => ({
				slug: a.slug,
				name: a.name,
				icon: a.icon ?? '🏅',
				description: a.description ?? '',
				scope: a.scope ?? 'tournament',
				data: a
			}))
	]);
</script>

<svelte:head>
	<title>Awards · The Ultimate Gamer</title>
	<meta
		name="description"
		content="The awards of The Ultimate Gamer, from Ultimate Gamer and Challenger to Ghost and Survivor."
	/>
</svelte:head>

<div class="container page">
	<PageTitle
		eyebrow="Honours"
		title="Awards"
		lead="Beyond the crown: the achievements, streaks and rivalries recognised at every tournament."
	>
		{#snippet actions()}
			{#if awards.status === 'success'}
				<LastUpdated
					generatedAt={awards.generatedAt}
					refreshing={awards.refreshing}
					error={awards.error}
				/>
			{/if}
		{/snippet}
	</PageTitle>

	{#if awards.status === 'error' && awards.error}
		<ErrorState error={awards.error} onretry={awards.retry} compact />
	{/if}

	<ul class="gallery">
		{#each gallery as award (award.slug)}
			{@const recipients = award.data?.recipients ?? []}
			<li class="award" class:crown={award.slug === 'ultimate-gamer'} id={award.slug}>
				<span class="icon" aria-hidden="true">{award.icon}</span>
				<div class="body">
					<div class="title-row">
						<h2>{award.name}</h2>
						{#if award.scope === 'career'}<span class="scope">Career</span>{/if}
					</div>
					<p class="muted desc">{award.description}</p>

					<div class="recipients" aria-live="polite">
						{#if awards.status === 'loading'}
							<span class="skeleton" aria-hidden="true"></span>
						{:else if awards.status === 'success'}
							{#if recipients.length}
								<ul>
									{#each recipients as r, i (`${r.player.slug}-${r.tournament?.slug ?? ''}-${i}`)}
										<li>
											<a href={resolve('/players/[slug]', { slug: r.player.slug })}
												>{r.player.name}</a
											>
											{#if r.tournament}<span class="subtle">· {r.tournament.name}</span>{/if}
											{#if r.detail}<span class="subtle detail">· {r.detail}</span>{/if}
										</li>
									{/each}
								</ul>
							{:else}
								<span class="subtle none">Not yet awarded</span>
							{/if}
						{/if}
					</div>
				</div>
			</li>
		{/each}
	</ul>
</div>

<style>
	.gallery {
		list-style: none;
		margin: 0;
		padding: 0;
		display: grid;
		gap: var(--sp-4);
		grid-template-columns: repeat(auto-fill, minmax(min(100%, 22rem), 1fr));
	}

	.award {
		display: grid;
		grid-template-columns: auto 1fr;
		gap: var(--sp-4);
		padding: var(--sp-5);
		background: var(--c-surface);
		border: var(--border);
		border-radius: var(--radius-lg);
		scroll-margin-top: 5rem;
	}

	.crown {
		grid-column: 1 / -1;
		border-color: var(--c-gold-line);
		background: linear-gradient(110deg, rgb(255 198 26 / 0.12), transparent 60%), var(--c-surface);
		box-shadow: var(--glow-gold);
	}

	.icon {
		display: grid;
		place-items: center;
		width: 3.25rem;
		height: 3.25rem;
		font-size: 1.6rem;
		background: var(--c-bg-raised);
		border: var(--border-strong);
		border-radius: var(--radius-md);
	}

	.crown .icon {
		border-color: var(--c-gold-line);
		background: var(--c-gold-soft);
	}

	.body {
		display: grid;
		align-content: start;
		gap: var(--sp-2);
		min-width: 0;
	}

	.title-row {
		display: flex;
		align-items: center;
		gap: var(--sp-2);
	}

	h2 {
		font-size: var(--fs-lg);
		text-transform: uppercase;
		letter-spacing: var(--tracking-wide);
	}

	.crown h2 {
		font-size: var(--fs-2xl);
		color: var(--c-gold-bright);
	}

	.scope {
		font-size: 0.6rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: var(--tracking-wide);
		padding: 0.1rem 0.4rem;
		border: 1px solid var(--c-violet);
		color: var(--c-violet);
		border-radius: var(--radius-sm);
	}

	.desc {
		font-size: var(--fs-sm);
	}

	.recipients {
		margin-top: var(--sp-2);
		padding-top: var(--sp-3);
		border-top: var(--border);
		font-size: var(--fs-sm);
		min-height: 2.2rem;
	}

	.recipients ul {
		list-style: none;
		margin: 0;
		padding: 0;
		display: grid;
		gap: 0.25rem;
	}

	.recipients a {
		font-weight: 600;
		text-decoration: none;
	}

	.detail,
	.none {
		font-size: var(--fs-xs);
	}

	.skeleton {
		display: block;
		width: 60%;
		height: 0.8rem;
		border-radius: var(--radius-sm);
		background: var(--c-surface-3);
	}
</style>
