<script lang="ts">
	import { getSiteConfig } from '#lib/data/client.ts';
	import { useResource } from '#lib/data/resource.svelte.ts';

	const site = useResource(getSiteConfig);
</script>

{#if site.data?.demo}
	<div class="demo-banner" role="note">
		<span class="tag">Demo</span>
		The results on this site are fictional demo data — the first real tournament is coming soon.
	</div>
{/if}

<style>
	.demo-banner {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: var(--sp-3);
		padding: var(--sp-2) var(--gutter);
		background: repeating-linear-gradient(
			-45deg,
			rgb(92 200 255 / 0.12) 0 12px,
			rgb(92 200 255 / 0.06) 12px 24px
		);
		border-bottom: 1px solid rgb(92 200 255 / 0.35);
		font-size: var(--fs-sm);
		color: var(--c-text);
		text-align: center;
	}

	.tag {
		padding: 0.1em 0.5em;
		border-radius: var(--radius-sm);
		background: var(--c-info);
		color: #04121a;
		font-family: var(--font-display);
		font-size: var(--fs-xs);
		font-weight: 800;
		letter-spacing: var(--tracking-wider);
		text-transform: uppercase;
	}
</style>
