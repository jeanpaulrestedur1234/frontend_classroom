import { useCallback, useEffect, useRef, useState } from 'react';
import type { PaginatedResponse } from '@/types';

/**
 * Hook for paginated API endpoints.
 * Handles page state, loading, and data extraction from PaginatedResponse.
 *
 * @example
 * const { data: bookings, page, totalPages, setPage, loading } = usePaginatedQuery(
 *   (p, ps) => listMyBookings({ page: p, page_size: ps }),
 * );
 */
export function usePaginatedQuery<T>(
  fetcher: (page: number, pageSize: number) => Promise<PaginatedResponse<T>>,
  options?: {
    pageSize?: number;
    immediate?: boolean;
  },
) {
  const pageSize = options?.pageSize ?? 20;

  const [data, setData] = useState<T[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(options?.immediate !== false);
  const [error, setError] = useState<string | null>(null);

  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  const execute = useCallback(
    async (p: number = page) => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetcherRef.current(p, pageSize);
        setData(Array.isArray(res.items) ? res.items : []);
        setTotal(res.total ?? 0);
        setPage(res.page ?? p);
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
    },
    [page, pageSize],
  );

  useEffect(() => {
    if (options?.immediate !== false) {
      execute(page);
    }
  }, [execute, page, options?.immediate]);

  const totalPages = Math.ceil(total / pageSize);

  return {
    data,
    setData,
    loading,
    error,
    page,
    pageSize,
    total,
    totalPages,
    setPage,
    refetch: () => execute(page),
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
    nextPage: () => setPage((p) => Math.min(p + 1, totalPages)),
    prevPage: () => setPage((p) => Math.max(p - 1, 1)),
  };
}
