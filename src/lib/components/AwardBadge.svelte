<script lang="ts">
	import { getAwardContent } from '#lib/content/awards.ts';

	interface Props {
		slug: string;
		iconOnly?: boolean;
		detail?: string | null;
	}

	let { slug, iconOnly = false, detail }: Props = $props();
	const award = $derived(getAwardContent(slug));
	const tooltip = $derived([award.name, award.description, detail].filter(Boolean).join(' — '));
</script>

<span class="award" class:icon-only={iconOnly} title={tooltip}>
	<span class="icon" aria-hidden="true">{award.icon}</span>
	{#if iconOnly}
		<span class="visually-hidden">{award.name}</span>
	{:else}
		<span class="label">{award.name}</span>
	{/if}
</span>

<style>
	.award {
		display: inline-flex;
		align-items: center;
		gap: 0.35em;
		padding: 0.15em 0.55em 0.15em 0.4em;
		border-radius: var(--radius-sm);
		background: var(--c-surface-3);
		border: 1px solid var(--c-border-strong);
		font-size: var(--fs-xs);
		font-weight: 600;
		white-space: nowrap;
		line-height: 1.4;
	}

	.icon-only {
		padding: 0.1em 0.25em;
		background: transparent;
		border-color: transparent;
	}

	.icon {
		line-height: 1;
	}
</style>
