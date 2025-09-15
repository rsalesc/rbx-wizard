import { useCallback } from 'react';
import { statementsService } from '../api';
import { useApi } from './useApi';

/**
 * Hook to fetch all statements
 */
export function useStatements() {
  // Memoize the API call to prevent infinite loops
  const apiCall = useCallback(() => statementsService.getStatements(), []);
  return useApi(apiCall, []); // Pass empty dependencies array
}

/**
 * Hook to fetch a single statement by ID
 */
export function useStatement(id: string) {
  return useApi(
    useCallback(() => statementsService.getStatement(id), [id]),
    [id]
  );
}

/**
 * Hook to fetch statement code by ID
 */
export function useStatementCode(id: string | null) {
  // Only create the API call function if we have an ID
  const apiCall = useCallback(() => {
    if (!id) {
      // Return a resolved promise with null to avoid triggering the API call
      return Promise.resolve(null);
    }
    return statementsService.getStatementCode(id);
  }, [id]);
  
  // Use the skip condition in dependencies to prevent calling when id is null
  const skipCall = !id;
  
  const result = useApi(
    apiCall,
    [id]
  );
  
  // If we're skipping the call, return a mock result
  if (skipCall) {
    return {
      data: null,
      loading: false,
      error: null,
      refetch: () => Promise.resolve()
    };
  }
  
  return result;
}
