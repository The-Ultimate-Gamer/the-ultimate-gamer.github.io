<script lang="ts">
	import { formatDateTime, formatRelative } from '#lib/format.ts';
	import { refreshData } from '#lib/data/resource.svelte.ts';
	import type { DataError } from '#lib/data/errors.ts';

	interface Props {
		generatedAt?: string;
		refreshing?: boolean;
		/** A refresh that failed while older data is still displayed. */
		error?: DataError;
	}

	let { generatedAt, refreshing = false, error }: Props = $props();

	let now = $state(Date.now());

	$effect(() => {
		const id = setInterval(() => (now = Date.now()), 30_000);
		return () => clearInterval(id);
	});
</script>

<div class="last-updated" aria-live="polite">
	{#if error}
		<span class="stale" role="status">Refresh failed – showing earlier data</span>
	{:else if generatedAt}
		<span class="subtle">
			Updated <time datetime={generatedAt} title={formatDateTime(generatedAt)}
				>{formatRelative(generatedAt, now)}</time
			>
		</span>
	{/if}
	<button class="refresh" onclick={refreshData} disabled={refreshing} aria-label="Refresh data">
		<svg class:spin={refreshing} viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
			<path
				fill="none"
				stroke="currentColor"
				stroke-width="2.4"
				stroke-linecap="round"
				d="M20 12a8 8 0 1 1-2.34-5.66M20 4v4h-4"
			/>
		</svg>
		<span>{refreshing ? 'Refreshing' : 'Refresh'}</span>
	</button>
</div>

<style>
	.last-updated {
		display: inline-flex;
		align-items: center;
		gap: var(--sp-3);
		font-size: var(--fs-xs);
	}

	.stale {
		color: var(--c-danger);
	}

	.refresh {
		display: inline-flex;
		align-items: center;
		gap: 0.35rem;
		padding: 0.3rem 0.6rem;
		background: transparent;
		border: var(--border-strong);
		border-radius: var(--radius-sm);
		color: var(--c-text-muted);
		font-size: var(--fs-xs);
		font-weight: 600;
		letter-spacing: var(--tracking-wide);
		text-transform: uppercase;
		cursor: pointer;
		transition:
			color var(--t-fast),
			border-color var(--t-fast);
	}

	.refresh:hover:not(:disabled) {
		color: var(--c-gold-bright);
		border-color: var(--c-gold-line);
	}

	.refresh:disabled {
		cursor: progress;
	}

	.spin {
		animation: spin 0.9s linear infinite;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}
</style>
