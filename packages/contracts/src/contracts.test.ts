import { describe, expect, it } from 'vitest';
import { z } from 'zod';

import {
  ApiErrorSchema,
  ERROR_CODES,
  ERROR_STATUS,
  PaginationQuerySchema,
  TaskStatus,
  TaskStatusSchema,
  paginatedEnvelope,
} from './index.js';

describe('enums', () => {
  it('exposes the board columns in order', () => {
    expect(TaskStatusSchema.options).toEqual(['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE']);
    expect(TaskStatus.IN_REVIEW).toBe('IN_REVIEW');
  });

  it('rejects unknown values', () => {
    expect(TaskStatusSchema.safeParse('BLOCKED').success).toBe(false);
  });
});

describe('envelopes', () => {
  it('parses a paginated envelope', () => {
    const schema = paginatedEnvelope(z.object({ id: z.string() }));
    const parsed = schema.parse({ data: [{ id: 'a' }], meta: { page: 1, pageSize: 20, total: 1 } });
    expect(parsed.data).toHaveLength(1);
  });

  it('coerces and defaults pagination query params', () => {
    expect(PaginationQuerySchema.parse({ page: '3' })).toEqual({ page: 3, pageSize: 20 });
    expect(PaginationQuerySchema.safeParse({ pageSize: '500' }).success).toBe(false);
  });
});

describe('errors', () => {
  it('maps every error code to an HTTP status', () => {
    for (const code of ERROR_CODES) expect(ERROR_STATUS[code]).toBeGreaterThanOrEqual(400);
  });

  it('validates the error envelope', () => {
    const ok = ApiErrorSchema.safeParse({ error: { code: 'NOT_FOUND', message: 'Nope' } });
    expect(ok.success).toBe(true);
  });
});
