import { node } from '@taskflow/config/eslint/node';

// Root-level files only; each workspace package has its own eslint.config.mjs.
export default [{ ignores: ['apps/**', 'packages/**'] }, ...node];
