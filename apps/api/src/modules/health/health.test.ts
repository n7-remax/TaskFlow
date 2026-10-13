import { HealthResponseSchema } from '@taskflow/contracts';
import request from 'supertest';
import { afterAll, afterEach, describe, expect, it, vi } from 'vitest';

import { createApp } from '../../app.js';
import { prisma } from '../../prisma/client.js';

const app = createApp();

afterEach(() => {
  vi.restoreAllMocks();
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe('GET /api/v1/health/live', () => {
  it('reports the process as alive without touching the database', async () => {
    const querySpy = vi.spyOn(prisma, '$queryRaw');

    const res = await request(app).get('/api/v1/health/live').expect(200);

    expect(HealthResponseSchema.parse(res.body).data.status).toBe('ok');
    expect(querySpy).not.toHaveBeenCalled();
  });
});

describe('GET /api/v1/health/ready', () => {
  it('returns 200 when the database is reachable', async () => {
    const res = await request(app).get('/api/v1/health/ready').expect(200);

    const { data } = HealthResponseSchema.parse(res.body);
    expect(data).toMatchObject({ status: 'ok', checks: { database: 'up' } });
  });

  it('returns 503 when the database check fails', async () => {
    vi.spyOn(prisma, '$queryRaw').mockRejectedValueOnce(new Error('connection refused'));

    const res = await request(app).get('/api/v1/health/ready').expect(503);

    expect(res.body.data).toMatchObject({ status: 'error', checks: { database: 'down' } });
  });
});

describe('unknown routes', () => {
  it('return the error envelope with 404', async () => {
    const res = await request(app).get('/api/v1/nope').expect(404);

    expect(res.body).toEqual({
      error: { code: 'NOT_FOUND', message: 'Route GET /api/v1/nope not found' },
    });
  });
});
