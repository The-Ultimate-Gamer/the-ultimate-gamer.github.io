/** An external link from the data, or null unless it's a well-formed https URL. */
export function safeLink(url: string | null | undefined): string | null {
	if (!url) return null;
	try {
		return new URL(url).protocol === 'https:' ? url : null;
	} catch {
		return null;
	}
}
