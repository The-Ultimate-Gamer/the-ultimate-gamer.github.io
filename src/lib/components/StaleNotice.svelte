<script lang="ts">
	import { siteConfig } from '#lib/config/site.ts';
	import { formatDateTime, formatRelative } from '#lib/format.ts';

	interface Props {
		/** When the tournament data last changed. */
		generatedAt?: string;
		live: boolean;
	}

	let { generatedAt, live }: Props = $props();

	let now = $state(Date.now());

	$effect(() => {
		const id = setInterval(() => (now = Date.now()), 60_000);
		return () => clearInterval(id);
	});

	const stale = $derived.by(() => {
		if (!live || !generatedAt) return false;
		const at = Date.parse(generatedAt);
		return !Number.isNaN(at) && now - at > siteConfig.data.staleLiveAfterMs;
	});
</script>

{#if stale && generatedAt}
	<p class="stale" role="status">
		<span aria-hidden="true">⚠</span>
		No updates since
		<time datetime={generatedAt} title={formatDateTime(generatedAt)}
			>{formatRelative(generatedAt, now)}</time
		>. Results may be behind, or the tournament has ended without being closed yet.
	</p>
{/if}

<style>
	.stale {
		display: flex;
		gap: var(--sp-2);
		padding: var(--sp-2) var(--sp-3);
		border: 1px solid rgb(92 200 255 / 0.4);
		background: var(--c-info-soft);
		border-radius: var(--radius-md);
		font-size: var(--fs-sm);
		color: var(--c-text);
	}
</style>
