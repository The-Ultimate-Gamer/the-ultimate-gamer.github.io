<script lang="ts">
	interface Props {
		status: 'champion' | 'challenger' | 'contender';
		size?: 'sm' | 'md';
	}

	let { status, size = 'md' }: Props = $props();

	const config = {
		champion: { icon: '👑', label: 'Ultimate Gamer' },
		challenger: { icon: '⚔', label: 'Challenger' },
		contender: { icon: '', label: 'Contender' }
	} as const;
</script>

<span class="status {status} {size}">
	{#if config[status].icon}<span class="icon" aria-hidden="true">{config[status].icon}</span>{/if}
	{config[status].label}
</span>

<style>
	.status {
		display: inline-flex;
		align-items: center;
		gap: 0.35em;
		padding: 0.2em 0.6em;
		border-radius: var(--radius-sm);
		font-family: var(--font-display);
		font-size: var(--fs-xs);
		font-weight: 800;
		letter-spacing: var(--tracking-wide);
		text-transform: uppercase;
		white-space: nowrap;
		line-height: 1.4;
		border: 1px solid transparent;
	}

	.sm {
		font-size: 0.65rem;
		padding: 0.1em 0.45em;
	}

	.champion {
		background: var(--c-gold);
		color: var(--c-on-gold);
		box-shadow: 0 0 18px -4px rgb(255 198 26 / 0.6);
	}

	.challenger {
		background: var(--c-challenger-soft);
		border-color: rgb(255 106 61 / 0.55);
		color: var(--c-challenger);
	}

	.contender {
		border-color: var(--c-border-strong);
		color: var(--c-text-subtle);
	}

	.icon {
		font-size: 1.05em;
		line-height: 1;
	}
</style>
