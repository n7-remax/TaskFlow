import type { HealthStatus } from '@taskflow/contracts';

import { prisma } from '../../prisma/client.js';

const DB_CHECK_TIMEOUT_MS = 2_000;

async function isDatabaseUp(): Promise<boolean> {
  let timer: NodeJS.Timeout | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error('Database check timed out')), DB_CHECK_TIMEOUT_MS);
  });
  try {
    await Promise.race([prisma.$queryRaw`SELECT 1`, timeout]);
    return true;
  } catch {
    return false;
  } finally {
    clearTimeout(timer);
  }
}

function snapshot(status: HealthStatus['status'], checks?: HealthStatus['checks']): HealthStatus {
  return {
    status,
    uptime: Math.round(process.uptime()),
    timestamp: new Date().toISOString(),
    ...(checks && { checks }),
  };
}

export const healthService = {
  live(): HealthStatus {
    return snapshot('ok');
  },

  async ready(): Promise<HealthStatus> {
    const database = (await isDatabaseUp()) ? 'up' : 'down';
    return snapshot(database === 'up' ? 'ok' : 'error', { database });
  },
};
