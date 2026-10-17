<script lang="ts">
	import { resolve } from '$app/paths';
	import { siteConfig } from '#lib/config/site.ts';

	const dataHost = (() => {
		try {
			return new URL(siteConfig.dataBaseUrl).host;
		} catch {
			return 'local data (development)';
		}
	})();
</script>

<footer class="site-footer">
	<div class="container inner">
		<div class="about">
			<p class="title">{siteConfig.name}</p>
			<p class="subtle">
				A multi-game LAN tournament. Score points, become a Challenger, then win one more.
			</p>
		</div>
		<nav aria-label="Footer">
			<ul>
				<li><a href={resolve('/rules')}>How it works</a></li>
				<li><a href={resolve('/tournaments')}>All tournaments</a></li>
				<li><a href={resolve('/history')}>Hall of champions</a></li>
			</ul>
		</nav>
		<p class="source subtle">
			Results are published separately and loaded live from <span class="num">{dataHost}</span>.
		</p>
	</div>
</footer>

<style>
	.site-footer {
		margin-top: auto;
		border-top: var(--border);
		background: var(--c-bg-raised);
		font-size: var(--fs-sm);
	}

	.inner {
		display: grid;
		gap: var(--sp-5);
		grid-template-columns: 1fr auto;
		padding-block: var(--sp-6);
	}

	.title {
		font-family: var(--font-display);
		font-weight: 800;
		text-transform: uppercase;
		letter-spacing: var(--tracking-wide);
		margin-bottom: var(--sp-1);
	}

	ul {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		gap: var(--sp-5);
		flex-wrap: wrap;
	}

	a {
		color: var(--c-text-muted);
		text-decoration: none;
	}

	.source {
		grid-column: 1 / -1;
		font-size: var(--fs-xs);
		border-top: var(--border);
		padding-top: var(--sp-4);
		overflow-wrap: anywhere;
	}

	@media (max-width: 720px) {
		.inner {
			grid-template-columns: 1fr;
		}
	}
</style>
