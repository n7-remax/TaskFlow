import { z } from 'zod';

import { dataEnvelope } from './envelopes.js';

export const HealthStatusSchema = z.object({
  status: z.enum(['ok', 'error']),
  uptime: z.number(),
  timestamp: z.iso.datetime(),
  checks: z.record(z.string(), z.enum(['up', 'down'])).optional(),
});
export type HealthStatus = z.infer<typeof HealthStatusSchema>;

export const HealthResponseSchema = dataEnvelope(HealthStatusSchema);
export type HealthResponse = z.infer<typeof HealthResponseSchema>;
