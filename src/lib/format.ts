const dateFormat = new Intl.DateTimeFormat('en-GB', {
	day: 'numeric',
	month: 'short',
	year: 'numeric'
});
const dateTimeFormat = new Intl.DateTimeFormat('en-GB', {
	day: 'numeric',
	month: 'short',
	year: 'numeric',
	hour: '2-digit',
	minute: '2-digit'
});

function parse(value: string | null | undefined): Date | null {
	if (!value) return null;
	const date = new Date(value);
	return Number.isNaN(date.getTime()) ? null : date;
}

export function formatDate(value: string | null | undefined): string {
	const date = parse(value);
	return date ? dateFormat.format(date) : '';
}

export function formatDateTime(value: string | null | undefined): string {
	const date = parse(value);
	return date ? dateTimeFormat.format(date) : '';
}

export function formatDateRange(start?: string | null, end?: string | null): string {
	const a = formatDate(start);
	const b = formatDate(end);
	if (a && b && a !== b) return `${a} – ${b}`;
	return a || b;
}

export function formatRelative(value: string | null | undefined, now = Date.now()): string {
	const date = parse(value);
	if (!date) return '';
	const seconds = Math.round((now - date.getTime()) / 1000);
	if (seconds < 45) return 'just now';
	const minutes = Math.round(seconds / 60);
	if (minutes < 60) return `${minutes} min ago`;
	const hours = Math.round(minutes / 60);
	if (hours < 24) return `${hours} h ago`;
	const days = Math.round(hours / 24);
	if (days < 30) return `${days} d ago`;
	return formatDate(value);
}

export function ordinal(n: number): string {
	const mod100 = n % 100;
	if (mod100 >= 11 && mod100 <= 13) return `${n}th`;
	return `${n}${['th', 'st', 'nd', 'rd'][n % 10] ?? 'th'}`;
}

export function initials(name: string): string {
	const parts = name.trim().split(/\s+/).filter(Boolean);
	if (parts.length === 0) return '?';
	if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
	return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function plural(count: number, one: string, many = `${one}s`): string {
	return `${count} ${count === 1 ? one : many}`;
}

export const statusLabel = {
	upcoming: 'Upcoming',
	ongoing: 'Live',
	completed: 'Completed'
} as const;
