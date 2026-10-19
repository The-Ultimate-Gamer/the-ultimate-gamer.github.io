<script lang="ts">
	import { shareUrl } from '#lib/data/client.ts';

	interface Props {
		kind: 'player' | 'tournament';
		slug: string;
		/** Shown in the system share sheet. */
		title: string;
	}

	let { kind, slug, title }: Props = $props();

	// The share page carries link-preview tags and redirects to this page.
	const url = $derived(shareUrl(kind, slug));
	let state = $state<'idle' | 'copied' | 'failed'>('idle');
	let timer: ReturnType<typeof setTimeout> | undefined;

	function flash(next: typeof state) {
		state = next;
		clearTimeout(timer);
		timer = setTimeout(() => (state = 'idle'), 2500);
	}

	async function share() {
		if (!url) return;
		// Phones get the system share sheet; elsewhere the link is copied.
		if (navigator.share && matchMedia('(pointer: coarse)').matches) {
			try {
				await navigator.share({ title, url });
				return;
			} catch (error) {
				if ((error as DOMException).name === 'AbortError') return;
			}
		}
		try {
			await navigator.clipboard.writeText(url);
			flash('copied');
		} catch {
			flash('failed');
		}
	}

	$effect(() => () => clearTimeout(timer));
</script>

{#if url}
	<span class="share">
		<button class="btn" type="button" onclick={share}>
			<svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
				<path
					fill="none"
					stroke="currentColor"
					stroke-width="2.2"
					stroke-linecap="round"
					stroke-linejoin="round"
					d="M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7M16 6l-4-4-4 4M12 2v13"
				/>
			</svg>
			Share
		</button>
		<span class="status" role="status">
			{#if state === 'copied'}Link copied{:else if state === 'failed'}
				Copy this link: <a href={url}>{url}</a>{/if}
		</span>
	</span>
{/if}

<style>
	.share {
		display: inline-flex;
		flex-wrap: wrap;
		align-items: center;
		gap: var(--sp-2);
	}

	.status {
		font-size: var(--fs-xs);
		color: var(--c-live);
		overflow-wrap: anywhere;
	}

	.status a {
		color: var(--c-text-muted);
	}
</style>
