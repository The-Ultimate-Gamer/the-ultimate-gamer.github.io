/** Link to a Discord user's profile, or null when the id isn't a Discord user id. */
export function discordProfileUrl(id: string | null | undefined): string | null {
	return id && /^\d{15,21}$/.test(id) ? `https://discord.com/users/${id}` : null;
}
