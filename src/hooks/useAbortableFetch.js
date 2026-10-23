// src/hooks/useAbortableFetch.js — VERSI DIPERBAIKI
import { useCallback, useEffect, useRef, useState } from 'react';
import { ApiAbortError } from '../utils/errors.js';

/**
 * @param {Function} fetcher - (signal) => Promise<T>
 * @param {Array} deps - stable deps array from caller
 */
export function useAbortableFetch(fetcher, deps = []) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tick, setTick] = useState(0);

  const fetcherRef = useRef(fetcher);
  useEffect(() => {
    fetcherRef.current = fetcher;
  }, [fetcher]);

  // Use JSON.stringify to make deps "static-length" for the exhaustive-deps rule
  // is a hack; better approach: caller controls `key`.
  const key = JSON.stringify([...deps, tick]); // eslint-disable-line react-hooks/exhaustive-deps

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
  }, [key]);

  const reload = useCallback(() => setTick((t) => t + 1), []);

  return { data, error, loading, reload };
}
