import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Generic data-fetching hook that replaces the repeated
 * useState+useEffect+try/catch pattern found across every page.
 *
 * @example
 * const { data: rooms, loading, error, refetch } = useQuery(listRooms);
 *
 * @example With transform
 * const { data: bookings } = useQuery(
 *   () => listMyBookings(),
 *   { transform: (res) => res.items }
 * );
 */
export function useQuery<TRaw, TData = TRaw>(
  fetcher: () => Promise<TRaw>,
  options?: {
    /** Transform the raw API response before storing it */
    transform?: (raw: TRaw) => TData;
    /** If false, don't fetch on mount. Call refetch() manually. */
    immediate?: boolean;
  },
) {
  type Data = TData extends never ? TRaw : TData;

  const [data, setData] = useState<Data | null>(null);
  const [loading, setLoading] = useState(options?.immediate !== false);
  const [error, setError] = useState<string | null>(null);

  // Keep fetcher stable reference without re-triggering the effect
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  const transformRef = useRef(options?.transform);
  transformRef.current = options?.transform;

  const execute = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const raw = await fetcherRef.current();
      const result = transformRef.current
        ? transformRef.current(raw)
        : raw;
      setData(result as Data);
    } catch (err: any) {
      const detail = err?.response?.data?.detail;
      setError(
        typeof detail === 'string'
          ? detail
          : Array.isArray(detail)
            ? detail.map((d: any) => d.msg).join('. ')
            : err.message || 'Error desconocido',
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (options?.immediate !== false) {
      execute();
    }
  }, [execute, options?.immediate]);

  return { data, loading, error, refetch: execute, setData };
}
