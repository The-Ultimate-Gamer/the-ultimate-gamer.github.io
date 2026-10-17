export type DataErrorKind =
	| 'network'
	| 'timeout'
	| 'http'
	| 'not-found'
	| 'invalid-json'
	| 'invalid-data'
	| 'unsupported-schema';

const messages: Record<DataErrorKind, string> = {
	network: 'Could not reach the tournament data server.',
	timeout: 'The tournament data server took too long to respond.',
	http: 'The tournament data server returned an error.',
	'not-found': 'The requested record does not exist.',
	'invalid-json': 'The tournament data could not be read.',
	'invalid-data': 'The tournament data is incomplete or malformed.',
	'unsupported-schema': 'The tournament data uses a newer format than this website supports.'
};

export class DataError extends Error {
	readonly kind: DataErrorKind;
	readonly url?: string;
	readonly status?: number;
	/** Technical detail for developers; not shown to visitors in production. */
	readonly detail?: string;

	constructor(
		kind: DataErrorKind,
		options: { url?: string; status?: number; detail?: string; cause?: unknown } = {}
	) {
		super(messages[kind], { cause: options.cause });
		this.name = 'DataError';
		this.kind = kind;
		this.url = options.url;
		this.status = options.status;
		this.detail = options.detail;
	}

	/** Whether retrying might help. */
	get retryable(): boolean {
		return this.kind === 'network' || this.kind === 'timeout' || this.kind === 'http';
	}
}

export function toDataError(error: unknown): DataError {
	if (error instanceof DataError) return error;
	return new DataError('invalid-data', {
		detail: error instanceof Error ? error.message : String(error),
		cause: error
	});
}
