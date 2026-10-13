import globals from 'globals';
import tseslint from 'typescript-eslint';

import { base } from './base.js';

/** Node.js services and libraries. */
export const node = tseslint.config(...base, {
  languageOptions: {
    globals: { ...globals.node },
  },
});

export default node;
