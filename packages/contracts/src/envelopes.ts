import { z } from 'zod';

/** `{ data }` — every successful single-resource response. */
export const dataEnvelope = <T extends z.ZodType>(data: T) => z.object({ data });
export type DataEnvelope<T> = { data: T };

export const PaginationMetaSchema = z.object({
  page: z.number().int().min(1),
  pageSize: z.number().int().min(1),
  total: z.number().int().min(0),
});
export type PaginationMeta = z.infer<typeof PaginationMetaSchema>;

/** `{ data, meta }` — paginated list responses. */
export const paginatedEnvelope = <T extends z.ZodType>(item: T) =>
  z.object({ data: z.array(item), meta: PaginationMetaSchema });
export type PaginatedEnvelope<T> = { data: T[]; meta: PaginationMeta };

export const PaginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});
export type PaginationQuery = z.infer<typeof PaginationQuerySchema>;
