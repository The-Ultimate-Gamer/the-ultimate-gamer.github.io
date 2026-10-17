import process from 'node:process';
import { defineConfig } from 'vitest/config';
import adapter from '@sveltejs/adapter-static';
import { sveltekit } from '@sveltejs/kit/vite';
import { devLocalData } from './tools/dev-local-data.ts';

const isDev = process.argv.includes('dev');

export default defineConfig({
	plugins: [
		sveltekit({
			compilerOptions: {
				// Force runes mode for the project, except for libraries. Can be removed in svelte 6.
				runes: ({ filename }) =>
					filename.split(/[/\\]/).includes('node_modules') ? undefined : true
			},
			adapter: adapter({
				// GitHub Pages serves 404.html for unknown paths; SvelteKit boots from it and
				// renders dynamic routes such as /players/[slug] client-side.
				fallback: '404.html'
			}),
			paths: {
				// e.g. BASE_PATH=/ultimate-gamer-website when hosted as a project site
				base: isDev ? '' : ((process.env.BASE_PATH ?? '') as '' | `/${string}`)
			},
			version: {
				// The site is static; no need to poll for new deployments.
				pollInterval: 0
			}
		}),
		devLocalData({
			// JSON exported by a local checkout of the data repository; never part of the build.
			dir: process.env.DEV_DATA_DIR ?? '../ultimate-gamer-data/data',
			delayMs: Number(process.env.FIXTURE_DELAY_MS ?? 0)
		})
	],
	test: {
		expect: { requireAssertions: true },
		projects: [
			{
				extends: './vite.config.ts',
				test: {
					name: 'server',
					environment: 'node',
					include: ['src/**/*.{test,spec}.{js,ts}'],
					exclude: ['src/**/*.svelte.{test,spec}.{js,ts}']
				}
			}
		]
	}
});
