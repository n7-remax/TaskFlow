import type { ApiError } from '@taskflow/contracts';
import type { ErrorRequestHandler } from 'express';
import { ZodError, z } from 'zod';

import { HttpError } from '../common/http-error.js';

function isBodyParserError(error: unknown): error is { status: number; type: string } {
  return (
    typeof error === 'object' &&
    error !== null &&
    'type' in error &&
    'status' in error &&
    typeof error.status === 'number' &&
    error.status < 500
  );
}

/**
 * Turns any thrown error into the `{ error: { code, message, details } }` envelope.
 * Unknown errors are logged with their stack and returned as a generic 500, so stack traces
 * and database messages never reach the client.
 */
export const errorHandler: ErrorRequestHandler = (error, req, res, _next) => {
  let httpError: HttpError;

  if (error instanceof HttpError) {
    httpError = error;
  } else if (error instanceof ZodError) {
    httpError = new HttpError(
      'VALIDATION_ERROR',
      'Request validation failed',
      z.flattenError(error),
    );
  } else if (isBodyParserError(error)) {
    httpError = HttpError.badRequest('Malformed request body');
  } else {
    req.log.error({ err: error }, 'Unhandled error');
    httpError = new HttpError('INTERNAL_ERROR', 'Something went wrong');
  }

  const body: ApiError = {
    error: {
      code: httpError.code,
      message: httpError.message,
      ...(httpError.details !== undefined && { details: httpError.details }),
    },
  };
  res.status(httpError.status).json(body);
};
