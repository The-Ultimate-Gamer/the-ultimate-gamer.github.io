<script lang="ts">
	interface Props {
		label?: string;
		rows?: number;
		/** Approximate height in rem to reserve, reducing layout shift. */
		minHeight?: number;
	}

	let { label = 'Loading tournament data…', rows = 5, minHeight }: Props = $props();
</script>

<div
	class="loading"
	role="status"
	aria-live="polite"
	style:min-height={minHeight ? `${minHeight}rem` : undefined}
>
	<span class="visually-hidden">{label}</span>
	{#each { length: rows }, i (i)}
		<div class="row" aria-hidden="true" style:--w="{92 - ((i * 17) % 35)}%">
			<span class="block short"></span>
			<span class="block line"></span>
			<span class="block tail"></span>
		</div>
	{/each}
</div>

<style>
	.loading {
		display: grid;
		align-content: start;
		gap: var(--sp-3);
		padding: var(--sp-4);
	}

	.row {
		display: grid;
		grid-template-columns: 2rem 1fr 4rem;
		gap: var(--sp-4);
		align-items: center;
		height: 2.25rem;
	}

	.block {
		height: 0.8rem;
		border-radius: var(--radius-sm);
		background: linear-gradient(
			90deg,
			var(--c-surface-2) 0%,
			var(--c-surface-3) 40%,
			var(--c-surface-2) 80%
		);
		background-size: 300% 100%;
		animation: shimmer 1.6s linear infinite;
	}

	.line {
		width: var(--w);
	}

	.short,
	.tail {
		width: 100%;
	}

	@keyframes shimmer {
		from {
			background-position: 100% 0;
		}
		to {
			background-position: -200% 0;
		}
	}
</style>
