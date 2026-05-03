import { useCallback, useRef, useState } from 'react';

/**
 * Hook for create/update/delete operations (mutations).
 * Manages loading + error state and exposes a stable execute function.
 *
 * @example
 * const { execute: create, loading } = useMutation(createRoom);
 *
 * async function handleSubmit() {
 *   const room = await create(formData);
 *   toast.success('Room created');
 * }
 */
export function useMutation<TArgs extends unknown[], TResult>(
  mutationFn: (...args: TArgs) => Promise<TResult>,
) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fnRef = useRef(mutationFn);
  fnRef.current = mutationFn;

  const execute = useCallback(async (...args: TArgs): Promise<TResult> => {
    setLoading(true);
    setError(null);
    try {
      const result = await fnRef.current(...args);
      return result;
    } catch (err: any) {
      const detail = err?.response?.data?.detail;
      const msg =
        typeof detail === 'string'
          ? detail
          : Array.isArray(detail)
            ? detail.map((d: any) => d.msg).join('. ')
            : err.message || 'Error desconocido';
      setError(msg);
      throw err; // Re-throw so the caller can handle it too
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setError(null);
    setLoading(false);
  }, []);

  return { execute, loading, error, reset };
}
