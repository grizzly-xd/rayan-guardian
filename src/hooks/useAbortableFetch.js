import { useCallback, useEffect, useRef, useState } from 'react';
import { ApiAbortError } from '../utils/errors.js';

/**
 * Small hook that executes an async fetcher once when deps change,
 * cancels on unmount/dep change, and exposes data/error/loading.
 *
 * Usage:
 *   const { data, error, loading, reload } = useAbortableFetch(
 *     (signal) => listDevices({ token, signal }),
 *     [token]
 *   );
 */
export function useAbortableFetch(fetcher, deps) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tick, setTick] = useState(0);

  const fetcherRef = useRef(fetcher);
  useEffect(() => {
    fetcherRef.current = fetcher;
  }, [fetcher]);

  useEffect(() => {
    const controller = new AbortController();
    let cancelled = false;
    setLoading(true);
    setError(null);

    Promise.resolve()
      .then(() => fetcherRef.current(controller.signal))
      .then((result) => {
        if (cancelled) return;
        setData(result);
        setLoading(false);
      })
      .catch((err) => {
        if (cancelled) return;
        if (err instanceof ApiAbortError) return;
        setError(err);
        setData(null);
        setLoading(false);
      });

    return () => {
      cancelled = true;
      controller.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, tick]);

  const reload = useCallback(() => setTick((t) => t + 1), []);

  return { data, error, loading, reload };
}
