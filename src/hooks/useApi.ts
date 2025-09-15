import { useState, useEffect, useCallback, useRef } from 'react';

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

interface UseApiResult<T> extends UseApiState<T> {
  refetch: () => Promise<void>;
}

export function useApi<T>(
  apiCall: () => Promise<T>,
  dependencies: React.DependencyList = []
): UseApiResult<T> {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: true,
    error: null,
  });

  // Use a ref to store the latest apiCall function
  const apiCallRef = useRef(apiCall);
  
  // Update the ref whenever apiCall changes
  useEffect(() => {
    apiCallRef.current = apiCall;
  });

  // Create a stable fetch function
  const fetchData = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const result = await apiCallRef.current();
      setState({ data: result, loading: false, error: null });
    } catch (error) {
      setState({ data: null, loading: false, error: error as Error });
    }
  }, []); // Empty dependencies since we use ref

  // Trigger fetch when dependencies change
  useEffect(() => {
    let cancelled = false;

    const doFetch = async () => {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      try {
        const result = await apiCallRef.current();
        if (!cancelled) {
          setState({ data: result, loading: false, error: null });
        }
      } catch (error) {
        if (!cancelled) {
          setState({ data: null, loading: false, error: error as Error });
        }
      }
    };

    doFetch();

    return () => {
      cancelled = true;
    };
  }, dependencies); // Only re-run when explicit dependencies change

  return {
    ...state,
    refetch: fetchData,
  };
}

interface UseMutationState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

interface UseMutationResult<T, P> extends UseMutationState<T> {
  mutate: (params: P) => Promise<T | undefined>;
  reset: () => void;
}

export function useMutation<T, P = void>(
  mutationFn: (params: P) => Promise<T>
): UseMutationResult<T, P> {
  const [state, setState] = useState<UseMutationState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const mutate = useCallback(async (params: P) => {
    setState({ data: null, loading: true, error: null });
    
    try {
      const result = await mutationFn(params);
      setState({ data: result, loading: false, error: null });
      return result;
    } catch (error) {
      setState({ data: null, loading: false, error: error as Error });
      return undefined;
    }
  }, [mutationFn]);

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null });
  }, []);

  return {
    ...state,
    mutate,
    reset,
  };
}
