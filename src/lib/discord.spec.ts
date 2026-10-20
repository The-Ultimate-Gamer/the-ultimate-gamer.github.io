import { describe, expect, it } from 'vitest';
import { discordProfileUrl } from './discord.ts';

describe('discordProfileUrl', () => {
	it('links numeric user ids', () => {
		expect(discordProfileUrl('80351110224678912')).toBe(
			'https://discord.com/users/80351110224678912'
		);
	});

	it('rejects anything else', () => {
		for (const id of [
			'',
			null,
			undefined,
			'1234',
			'8035111022467891a',
			'../evil',
			'80351110224678912/x'
		]) {
			expect(discordProfileUrl(id)).toBeNull();
		}
	});
});
