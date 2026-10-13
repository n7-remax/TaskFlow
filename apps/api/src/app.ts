import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { type Express } from 'express';
import helmet from 'helmet';
import { pinoHttp } from 'pino-http';

import { logger } from './common/logger.js';
import { env } from './config/env.js';

export function createApp(): Express {
  const app = express();

  app.disable('x-powered-by');
  app.use(
    pinoHttp({
      logger,
      serializers: {
        req: (req: { id: unknown; method: string; url: string }) => ({
          id: req.id,
          method: req.method,
          url: req.url,
        }),
        res: (res: { statusCode: number }) => ({ statusCode: res.statusCode }),
      },
    }),
  );
  app.use(helmet());
  app.use(cors({ origin: env.CORS_ORIGINS, credentials: true }));
  app.use(express.json({ limit: '100kb' }));
  app.use(cookieParser());

  const v1 = express.Router();
  app.use('/api/v1', v1);

  return app;
}
