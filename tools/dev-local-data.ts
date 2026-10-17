import { readFile } from 'node:fs/promises';
import path from 'node:path';
import type { Plugin } from 'vite';

/**
 * Dev-server-only middleware that serves JSON from a local data directory (e.g. a checkout
 * of the data repository) under `/__local-data/`. Never part of a build (`apply: 'serve'`).
 */
export function devLocalData(options: { dir: string; prefix?: string; delayMs?: number }): Plugin {
	const root = path.resolve(options.dir);
	const prefix = options.prefix ?? '/__local-data';
	const delayMs = options.delayMs ?? 0;

	return {
		name: 'ultimate-gamer:dev-local-data',
		apply: 'serve',
		configureServer(server) {
			server.middlewares.use(prefix, async (req, res, next) => {
				let requested: string;
				try {
					requested = decodeURIComponent((req.url ?? '/').split('?')[0]);
				} catch {
					return next();
				}
				const file = path.resolve(root, `.${requested}`);
				// Prevent path traversal outside the data directory.
				if (!file.startsWith(root + path.sep) || !file.endsWith('.json')) return next();

				if (delayMs > 0) await new Promise((r) => setTimeout(r, delayMs));

				try {
					const body = await readFile(file);
					res.setHeader('Content-Type', 'application/json; charset=utf-8');
					res.setHeader('Cache-Control', 'no-cache');
					res.setHeader('Access-Control-Allow-Origin', '*');
					res.end(body);
				} catch {
					res.statusCode = 404;
					res.setHeader('Content-Type', 'text/plain; charset=utf-8');
					res.end('Not found');
				}
			});
		}
	};
}
