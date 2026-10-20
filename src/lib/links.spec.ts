import { describe, expect, it } from 'vitest';
import { safeLink } from './links.ts';

describe('safeLink', () => {
	it('keeps https links', () => {
		expect(safeLink('https://store.steampowered.com/app/1')).toBe(
			'https://store.steampowered.com/app/1'
		);
	});

	it('drops anything else', () => {
		for (const url of [null, undefined, '', 'http://x.com', 'javascript:alert(1)', 'not a url']) {
			expect(safeLink(url)).toBeNull();
		}
	});
});
