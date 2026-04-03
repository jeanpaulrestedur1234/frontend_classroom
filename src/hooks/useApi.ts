import { useCallback, useEffect, useState } from 'react';

export function useApi<T>(apiFn: () => Promise<T>) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await apiFn();
      setData(result);
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Error desconocido');
    } finally {
      setLoading(false);
    }
  }, [apiFn]);

  useEffect(() => {
    execute();
  }, [execute]);

  return { data, loading, error, refetch: execute };
}
