import { useCallback, useEffect, useState } from "react";

interface PolledFetchState<T> {
  data: T | null;
  error: string | null;
  loading: boolean;
}

/** Fetches a JSON endpoint immediately, then re-fetches on an interval. Exposes a manual refresh for pull-to-refresh. */
export function usePolledFetch<T>(url: string, intervalMs: number) {
  const [state, setState] = useState<PolledFetchState<T>>({
    data: null,
    error: null,
    loading: true,
  });
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(
    async (isManualRefresh: boolean) => {
      if (isManualRefresh) setRefreshing(true);
      try {
        const res = await fetch(url);
        const body = await res.json();
        if (!res.ok) {
          setState({ data: null, error: body?.error ?? "Request failed", loading: false });
          return;
        }
        setState({ data: body as T, error: null, loading: false });
      } catch (err) {
        setState({
          data: null,
          error: err instanceof Error ? err.message : "Request failed",
          loading: false,
        });
      } finally {
        if (isManualRefresh) setRefreshing(false);
      }
    },
    [url]
  );

  useEffect(() => {
    let cancelled = false;
    setState((s) => ({ ...s, loading: true }));
    load(false);
    const id = setInterval(() => {
      if (!cancelled) load(false);
    }, intervalMs);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [url, intervalMs, load]);

  return { ...state, refreshing, refresh: () => load(true) };
}
