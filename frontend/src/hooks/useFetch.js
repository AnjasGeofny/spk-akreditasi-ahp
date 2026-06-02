import { useState, useEffect, useCallback } from 'react';

export default function useFetch(apiFn, deps = [], autoFetch = true) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(autoFetch);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async (...args) => {
    setLoading(true);
    setError(null);
    try {
      const result = await apiFn(...args);
      setData(result.data);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, deps);

  useEffect(() => {
    if (autoFetch) {
      fetchData();
    }
  }, [autoFetch, fetchData]);

  return { data, loading, error, refetch: fetchData, setData };
}
