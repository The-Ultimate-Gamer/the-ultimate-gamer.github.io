<script lang="ts">
	import { getCategoryContent } from '#lib/content/categories.ts';

	interface Props {
		slug: string;
		/** Show only the icon (name remains available to assistive tech). */
		iconOnly?: boolean;
		size?: 'sm' | 'md' | 'lg';
		/** Hover text; defaults to the category name for icon-only badges. */
		tooltip?: string;
	}

	let { slug, iconOnly = false, size = 'md', tooltip }: Props = $props();
	const category = $derived(getCategoryContent(slug));
	const accent = $derived(
		/^[a-z0-9-]+$/.test(slug) ? `var(--cat-${slug}, var(--c-gold))` : 'var(--c-gold)'
	);
</script>

<span
	class="category {size}"
	class:icon-only={iconOnly}
	style:--accent={accent}
	title={tooltip ?? (iconOnly ? category.name : undefined)}
>
	<span class="icon" aria-hidden="true">{category.icon}</span>
	{#if iconOnly}
		<span class="visually-hidden">{category.name}</span>
	{:else}
		<span class="label">{category.name}</span>
	{/if}
</span>

<style>
	.category {
		display: inline-flex;
		align-items: center;
		gap: 0.4em;
		padding: 0.2em 0.6em 0.2em 0.45em;
		border-radius: var(--radius-sm);
		border: 1px solid color-mix(in srgb, var(--accent) 45%, transparent);
		background: color-mix(in srgb, var(--accent) 12%, transparent);
		color: color-mix(in srgb, var(--accent) 80%, white);
		font-family: var(--font-display);
		font-size: var(--fs-xs);
		font-weight: 700;
		letter-spacing: var(--tracking-wide);
		text-transform: uppercase;
		white-space: nowrap;
		line-height: 1.4;
	}

	.icon-only {
		padding: 0.15em 0.3em;
	}

	.lg {
		font-size: var(--fs-sm);
		padding: 0.3em 0.75em 0.3em 0.55em;
	}

	.icon {
		font-size: 1.1em;
		line-height: 1;
	}
</style>
