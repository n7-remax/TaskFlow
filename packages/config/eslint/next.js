import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTypescript from 'eslint-config-next/typescript';
import tseslint from 'typescript-eslint';

import { base } from './base.js';

/** Next.js App Router apps: base rules plus Next's core-web-vitals and TypeScript presets. */
export const next = tseslint.config(...nextVitals, ...nextTypescript, ...base, {
  ignores: ['next-env.d.ts'],
});

export default next;
