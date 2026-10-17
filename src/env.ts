import { defineEnvVars } from '@sveltejs/kit/env';

export const variables = defineEnvVars({
	PUBLIC_DATA_BASE_URL: {
		public: true,
		static: true,
		description:
			'Base URL of the published data repository JSON (must end with a slash). Falls back to the default in src/lib/config/site.ts.',
		schema: (value) => {
			const trimmed = value?.trim() ?? '';
			if (trimmed && !/^(https:\/\/|http:\/\/localhost|\/)/.test(trimmed)) {
				throw new Error('PUBLIC_DATA_BASE_URL must be an https:// URL or a root-relative path');
			}
			return trimmed;
		}
	}
});
