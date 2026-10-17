<script lang="ts">
	import { initials as toInitials } from '#lib/format.ts';

	interface Props {
		name: string;
		initials?: string | null;
		avatarUrl?: string | null;
		size?: 'sm' | 'md' | 'lg' | 'xl';
		highlight?: 'champion' | 'challenger' | null;
	}

	let { name, initials, avatarUrl, size = 'md', highlight = null }: Props = $props();

	// Only absolute https images are accepted from external data.
	const safeAvatar = $derived(avatarUrl && /^https:\/\//i.test(avatarUrl) ? avatarUrl : null);
	let failed = $state(false);

	// Deterministic hue so players are recognisable without relying on images.
	const hue = $derived([...name].reduce((h, c) => (h * 31 + c.charCodeAt(0)) % 360, 7));
</script>

<span
	class="avatar {size}"
	class:champion={highlight === 'champion'}
	class:challenger={highlight === 'challenger'}
	style:--hue={hue}
	aria-hidden="true"
>
	{#if safeAvatar && !failed}
		<img src={safeAvatar} alt="" loading="lazy" onerror={() => (failed = true)} />
	{:else}
		{(initials || toInitials(name)).slice(0, 3)}
	{/if}
</span>

<style>
	.avatar {
		--size: 2.25rem;
		flex: none;
		display: inline-grid;
		place-items: center;
		width: var(--size);
		height: var(--size);
		border-radius: var(--radius-md);
		background: linear-gradient(
			135deg,
			hsl(var(--hue) 45% 30%),
			hsl(calc(var(--hue) + 40) 40% 16%)
		);
		box-shadow: inset 0 0 0 1px rgb(255 255 255 / 0.08);
		color: hsl(var(--hue) 70% 88%);
		font-family: var(--font-display);
		font-weight: 800;
		font-size: calc(var(--size) * 0.38);
		letter-spacing: 0.02em;
		overflow: hidden;
	}

	.sm {
		--size: 1.75rem;
	}
	.lg {
		--size: 3.25rem;
	}
	.xl {
		--size: 5.5rem;
		border-radius: var(--radius-lg);
	}

	.champion {
		box-shadow: var(--glow-gold);
	}
	.challenger {
		box-shadow: var(--glow-challenger);
	}

	img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}
</style>
