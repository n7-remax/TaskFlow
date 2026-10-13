import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

import type { TestProject } from 'vitest/node';

const apiRoot = fileURLToPath(new URL('../..', import.meta.url));

/** Brings the test database up to the latest migration once, before any test file runs. */
export default function setup(project: TestProject): void {
  const databaseUrl = project.config.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error('vitest.config.ts must set test.env.DATABASE_URL');
  }

  // Output is piped so a clean run stays quiet; on failure execFileSync's error includes stderr.
  execFileSync('pnpm', ['exec', 'prisma', 'migrate', 'deploy'], {
    cwd: apiRoot,
    env: { ...process.env, DATABASE_URL: databaseUrl },
    stdio: 'pipe',
  });
}
