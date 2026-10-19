<script lang="ts">
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
	import { afterNavigate } from '$app/navigation';
	import { siteConfig } from '#lib/config/site.ts';

	const links = [
		{ href: resolve('/tournaments'), label: 'Tournaments' },
		{ href: resolve('/players'), label: 'Players' },
		{ href: resolve('/games'), label: 'Games' },
		{ href: resolve('/awards'), label: 'Awards' },
		{ href: resolve('/rules'), label: 'Rules' }
	];
	const home = resolve('/');

	let open = $state(false);

	afterNavigate(() => {
		open = false;
	});

	function isActive(href: string): boolean {
		const path = page.url.pathname.replace(/\/$/, '') || '/';
		const target = href.replace(/\/$/, '') || '/';
		if (href === home) return path === target;
		return path === target || path.startsWith(`${target}/`);
	}
</script>

<header class="site-header">
	<div class="container bar">
		<a class="brand" href={home} aria-label="{siteConfig.name} – home">
			<span class="mark" aria-hidden="true">UG</span>
			<span class="wordmark">
				<span class="the">The</span>
				<span class="name">Ultimate Gamer</span>
			</span>
		</a>

		<button
			class="menu-toggle"
			aria-expanded={open}
			aria-controls="site-nav"
			onclick={() => (open = !open)}
		>
			<span class="visually-hidden">{open ? 'Close menu' : 'Open menu'}</span>
			<span class="burger" class:open aria-hidden="true"><span></span></span>
		</button>

		<nav id="site-nav" class:open aria-label="Main">
			<ul>
				{#each links as link (link.href)}
					<li>
						<a href={link.href} aria-current={isActive(link.href) ? 'page' : undefined}>
							{link.label}
						</a>
					</li>
				{/each}
			</ul>
		</nav>
	</div>
</header>

<style>
	.site-header {
		position: sticky;
		top: 0;
		z-index: 20;
		background: rgb(9 9 11 / 0.82);
		backdrop-filter: blur(12px);
		border-bottom: var(--border);
	}

	.bar {
		display: flex;
		align-items: center;
		gap: var(--sp-5);
		min-height: 4rem;
	}

	.brand {
		display: flex;
		align-items: center;
		gap: var(--sp-3);
		text-decoration: none;
		margin-right: auto;
	}

	.mark {
		display: grid;
		place-items: center;
		width: 2.25rem;
		height: 2.25rem;
		background: var(--c-gold);
		color: var(--c-on-gold);
		font-family: var(--font-display);
		font-weight: 800;
		font-size: 0.95rem;
		letter-spacing: 0.02em;
		clip-path: polygon(18% 0, 100% 0, 100% 82%, 82% 100%, 0 100%, 0 18%);
	}

	.wordmark {
		display: grid;
		line-height: 1;
		font-family: var(--font-display);
		text-transform: uppercase;
	}

	.the {
		font-size: 0.6rem;
		letter-spacing: var(--tracking-wider);
		color: var(--c-gold);
	}

	.name {
		font-size: 1.05rem;
		font-weight: 800;
		letter-spacing: 0.04em;
	}

	nav ul {
		display: flex;
		gap: var(--sp-1);
		list-style: none;
		margin: 0;
		padding: 0;
	}

	nav a {
		display: block;
		padding: 0.5rem 0.8rem;
		font-family: var(--font-display);
		font-size: var(--fs-sm);
		font-weight: 700;
		letter-spacing: var(--tracking-wide);
		text-transform: uppercase;
		text-decoration: none;
		color: var(--c-text-muted);
		border-radius: var(--radius-sm);
		position: relative;
	}

	nav a:hover {
		color: var(--c-text);
	}

	nav a[aria-current='page'] {
		color: var(--c-text);
	}

	nav a[aria-current='page']::after {
		content: '';
		position: absolute;
		left: 0.8rem;
		right: 0.8rem;
		bottom: -0.7rem;
		height: 2px;
		background: var(--c-gold);
		box-shadow: 0 0 12px var(--c-gold);
	}

	.menu-toggle {
		display: none;
		background: none;
		border: var(--border-strong);
		border-radius: var(--radius-md);
		width: 2.5rem;
		height: 2.5rem;
		padding: 0;
		cursor: pointer;
	}

	.burger,
	.burger::before,
	.burger::after,
	.burger span {
		display: block;
	}

	.burger {
		position: relative;
		width: 1.1rem;
		height: 0.8rem;
		margin: auto;
	}

	.burger::before,
	.burger::after,
	.burger span {
		content: '';
		position: absolute;
		left: 0;
		width: 100%;
		height: 2px;
		background: currentColor;
		transition:
			transform var(--t-base) var(--ease-out),
			opacity var(--t-fast);
	}

	.burger::before {
		top: 0;
	}
	.burger span {
		top: calc(50% - 1px);
	}
	.burger::after {
		bottom: 0;
	}

	.burger.open::before {
		transform: translateY(calc(0.4rem - 1px)) rotate(45deg);
	}
	.burger.open span {
		opacity: 0;
	}
	.burger.open::after {
		transform: translateY(calc(-0.4rem + 1px)) rotate(-45deg);
	}

	@media (max-width: 860px) {
		.menu-toggle {
			display: grid;
		}

		nav {
			display: none;
			position: absolute;
			top: 100%;
			left: 0;
			right: 0;
			background: var(--c-bg-raised);
			border-bottom: var(--border);
			padding: var(--sp-3) var(--gutter) var(--sp-4);
		}

		nav.open {
			display: block;
		}

		nav ul {
			flex-direction: column;
		}

		nav a {
			padding: 0.75rem 0.5rem;
			font-size: var(--fs-md);
		}

		nav a[aria-current='page']::after {
			left: 0;
			right: auto;
			top: 0.6rem;
			bottom: 0.6rem;
			width: 2px;
			height: auto;
			margin-left: -0.5rem;
		}
	}
</style>
