<script lang="ts">
	import { dev } from '$app/env';
	import type { DataError } from '#lib/data/errors.ts';

	interface Props {
		error: DataError;
		onretry?: () => void;
		compact?: boolean;
	}

	let { error, onretry, compact = false }: Props = $props();

	const titles: Record<DataError['kind'], string> = {
		network: 'Connection problem',
		timeout: 'Request timed out',
		http: 'Data server error',
		'not-found': 'Not found',
		'invalid-json': 'Unreadable data',
		'invalid-data': 'Unexpected data',
		'unsupported-schema': 'Website update needed'
	};
</script>

<div class="error-state" class:compact role="alert">
	<span class="icon" aria-hidden="true">!</span>
	<div class="body">
		<p class="title">{titles[error.kind]}</p>
		<p class="muted">
			{error.message}
			{#if error.retryable}Check your connection and try again.{/if}
		</p>
		{#if dev && (error.detail || error.url)}
			<details>
				<summary>Diagnostics (development only)</summary>
				<pre>{[error.status && `HTTP ${error.status}`, error.url, error.detail]
						.filter(Boolean)
						.join('\n')}</pre>
			</details>
		{/if}
	</div>
	{#if onretry && error.kind !== 'not-found'}
		<button class="btn" onclick={onretry}>Retry</button>
	{/if}
</div>

<style>
	.error-state {
		display: grid;
		grid-template-columns: auto 1fr auto;
		align-items: start;
		gap: var(--sp-4);
		padding: var(--sp-5);
		border: 1px solid rgb(255 84 104 / 0.35);
		background: var(--c-danger-soft);
		border-radius: var(--radius-lg);
	}

	.compact {
		padding: var(--sp-3) var(--sp-4);
		font-size: var(--fs-sm);
	}

	.icon {
		display: grid;
		place-items: center;
		width: 1.75rem;
		height: 1.75rem;
		border-radius: 50%;
		background: var(--c-danger);
		color: #1a0408;
		font-weight: 800;
		font-family: var(--font-display);
	}

	.title {
		font-family: var(--font-display);
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: var(--tracking-wide);
		margin-bottom: var(--sp-1);
	}

	details {
		margin-top: var(--sp-3);
		font-size: var(--fs-xs);
	}

	summary {
		cursor: pointer;
		color: var(--c-text-subtle);
	}

	pre {
		margin: var(--sp-2) 0 0;
		padding: var(--sp-3);
		background: var(--c-bg);
		border-radius: var(--radius-sm);
		white-space: pre-wrap;
		overflow-wrap: anywhere;
		font-family: var(--font-mono);
	}

	@media (max-width: 560px) {
		.error-state {
			grid-template-columns: auto 1fr;
		}
		.btn {
			grid-column: 2;
			justify-self: start;
		}
	}
</style>
