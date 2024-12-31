import { createEnv } from '@t3-oss/env-core';
import { z } from 'zod';
import type { Env } from './types/env';


export const env = (cEnv: Env = process.env) => {
	return createEnv({
		server: {
      APP_NAME: z.string().min(1)
			.default('Miles Creative Auth'),
      MC_AUTH_URL: z.string().url(),
      MC_AUTH_SECRET: z.string().min(1).default('mc-auth-secret-123456789'),
      NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
		},

		/**
		 * The prefix that client-side variables must have. This is enforced both at
		 * a type-level and at runtime.
		 */
		clientPrefix: 'PUBLIC_',

		client: {
			//PUBLIC_CLERK_PUBLISHABLE_KEY: z.string().min(1),
		},

		/**
		 * What object holds the environment variables at runtime. This is usually
		 * `process.env` or `import.meta.env`.
		 */
		runtimeEnv: {...cEnv,
      MC_AUTH_URL: cEnv.MC_AUTH_URL || cEnv.NEXT_PUBLIC_APP_URL || cEnv.VERCEL_URL || cEnv.BETTER_AUTH_URL
    },

		/**
		 * By default, this library will feed the environment variables directly to
		 * the Zod validator.
		 *
		 * This means that if you have an empty string for a value that is supposed
		 * to be a number (e.g. `PORT=` in a ".env" file), Zod will incorrectly flag
		 * it as a type mismatch violation. Additionally, if you have an empty string
		 * for a value that is supposed to be a string with a default value (e.g.
		 * `DOMAIN=` in an ".env" file), the default value will never be applied.
		 *
		 * In order to solve these issues, we recommend that all new projects
		 * explicitly specify this option as true.
		 */
		emptyStringAsUndefined: true,
	});
};
