import { ERROR_STATUS, type ErrorCode } from '@taskflow/contracts';

/** An error that is safe to expose to clients: its code and message end up in the response body. */
export class HttpError extends Error {
  readonly status: number;

  constructor(
    readonly code: ErrorCode,
    message: string,
    readonly details?: unknown,
  ) {
    super(message);
    this.name = 'HttpError';
    this.status = ERROR_STATUS[code];
  }

  static badRequest(message = 'Bad request', details?: unknown) {
    return new HttpError('BAD_REQUEST', message, details);
  }
  static unauthorized(message = 'Authentication required') {
    return new HttpError('UNAUTHORIZED', message);
  }
  static forbidden(message = 'You do not have access to this resource') {
    return new HttpError('FORBIDDEN', message);
  }
  static notFound(message = 'Resource not found') {
    return new HttpError('NOT_FOUND', message);
  }
  static conflict(message: string, details?: unknown) {
    return new HttpError('CONFLICT', message, details);
  }
}
