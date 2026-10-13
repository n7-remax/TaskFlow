'use client';

import type { HealthResponse } from '@taskflow/contracts';
import { cn } from 'cn';
import { RefreshCw } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';

type Status = 'checking' | 'online' | 'degraded' | 'offline';

const LABELS: Record<Status, string> = {
  checking: 'Checking API…',
  online: 'API and database online',
  degraded: 'API up, database unreachable',
  offline: 'API offline',
};

const DOT: Record<Status, string> = {
  checking: 'bg-muted-foreground animate-pulse',
  online: 'bg-emerald-500',
  degraded: 'bg-amber-500',
  offline: 'bg-red-500',
};

async function fetchStatus(signal?: AbortSignal): Promise<Status> {
  try {
    const res = await fetch('/api/v1/health/ready', { cache: 'no-store', signal });
    const body = (await res.json()) as HealthResponse;
    return body.data.checks?.database === 'up' ? 'online' : 'degraded';
  } catch (error) {
    if (signal?.aborted) throw error;
    return 'offline';
  }
}

/** Live readiness check through the Next.js → Express proxy. */
export function ApiStatus() {
  const [status, setStatus] = useState<Status>('checking');

  const refresh = useCallback(() => {
    setStatus('checking');
    fetchStatus().then(setStatus);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    fetchStatus(controller.signal).then(setStatus, () => {});
    return () => controller.abort();
  }, []);

  return (
    <div
      role="status"
      aria-live="polite"
      className="inline-flex items-center gap-2 rounded-full border bg-background/60 py-1 pr-1 pl-3 text-sm text-muted-foreground backdrop-blur"
    >
      <span className={cn('size-2 rounded-full', DOT[status])} aria-hidden />
      <span>{LABELS[status]}</span>
      <Button
        variant="ghost"
        size="icon-xs"
        onClick={refresh}
        disabled={status === 'checking'}
        aria-label="Re-check API status"
      >
        <RefreshCw className={cn(status === 'checking' && 'animate-spin')} />
      </Button>
    </div>
  );
}
