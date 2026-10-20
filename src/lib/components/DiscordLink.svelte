<script lang="ts">
	import type { DiscordAccount } from '#lib/data/types.ts';
	import { discordProfileUrl } from '#lib/discord.ts';

	interface Props {
		account: DiscordAccount;
	}

	let { account }: Props = $props();

	const href = $derived(discordProfileUrl(account.id));
	const name = $derived(account.displayName || account.username || null);
</script>

{#if href}
	<a class="discord" {href} target="_blank" rel="noopener noreferrer external">
		<span class="tag">Discord</span>
		{#if name}<span class="name">{name}</span>{/if}
		{#if account.username && account.username !== name}
			<span class="user">@{account.username}</span>
		{:else if !name}
			<span class="user">Open profile</span>
		{/if}
		<span aria-hidden="true" class="ext">↗</span>
		<span class="visually-hidden">(opens Discord)</span>
	</a>
{/if}

<style>
	.discord {
		display: inline-flex;
		align-items: center;
		flex-wrap: wrap;
		gap: 0.4rem;
		padding: 0.25rem 0.6rem 0.25rem 0.3rem;
		border: 1px solid color-mix(in srgb, var(--c-discord) 55%, transparent);
		background: color-mix(in srgb, var(--c-discord) 14%, transparent);
		border-radius: var(--radius-md);
		font-size: var(--fs-sm);
		text-decoration: none;
		color: var(--c-text);
		transition: border-color var(--t-fast);
	}

	.discord:hover {
		border-color: var(--c-discord);
	}

	.tag {
		padding: 0.05rem 0.4rem;
		border-radius: var(--radius-sm);
		background: var(--c-discord);
		color: white;
		font-family: var(--font-display);
		font-size: var(--fs-xs);
		font-weight: 700;
		letter-spacing: var(--tracking-wide);
		text-transform: uppercase;
	}

	.name {
		font-weight: 600;
	}

	.user {
		color: var(--c-text-muted);
	}

	.ext {
		color: var(--c-text-subtle);
		font-size: var(--fs-xs);
	}
</style>
