import type { HealthResponse } from '@taskflow/contracts';
import type { Request, Response } from 'express';

import { healthService } from './service.js';

export const healthController = {
  live(_req: Request, res: Response<HealthResponse>) {
    res.json({ data: healthService.live() });
  },

  async ready(_req: Request, res: Response<HealthResponse>) {
    const health = await healthService.ready();
    res.status(health.status === 'ok' ? 200 : 503).json({ data: health });
  },
};
