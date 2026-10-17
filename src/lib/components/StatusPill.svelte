<script lang="ts">
	import type { TournamentStatus } from '#lib/data/types.ts';
	import { statusLabel } from '#lib/format.ts';

	interface Props {
		status: TournamentStatus;
		demo?: boolean;
	}

	let { status, demo = false }: Props = $props();
</script>

<span class="pill {status}">
	<span class="dot" aria-hidden="true"></span>
	{statusLabel[status]}
</span>
{#if demo}<span class="pill demo" title="Fictional demo data">Demo</span>{/if}

<style>
	.demo {
		color: var(--c-info);
		border-style: dashed;
		border-color: rgb(92 200 255 / 0.5);
	}
	.pill {
		display: inline-flex;
		align-items: center;
		gap: 0.45em;
		padding: 0.25em 0.7em;
		border-radius: 999px;
		border: var(--border-strong);
		font-family: var(--font-display);
		font-size: var(--fs-xs);
		font-weight: 800;
		letter-spacing: var(--tracking-wider);
		text-transform: uppercase;
		white-space: nowrap;
	}

	.dot {
		width: 0.5em;
		height: 0.5em;
		border-radius: 50%;
		background: currentColor;
	}

	.ongoing {
		color: var(--c-live);
		border-color: rgb(61 220 132 / 0.4);
		background: var(--c-live-soft);
	}

	.ongoing .dot {
		box-shadow: 0 0 0 0 rgb(61 220 132 / 0.6);
		animation: ping 1.8s ease-out infinite;
	}

	.completed {
		color: var(--c-gold);
		border-color: var(--c-gold-line);
		background: var(--c-gold-soft);
	}

	.upcoming {
		color: var(--c-info);
		border-color: rgb(92 200 255 / 0.4);
		background: var(--c-info-soft);
	}

	@keyframes ping {
		to {
			box-shadow: 0 0 0 0.6em rgb(61 220 132 / 0);
		}
	}
</style>
