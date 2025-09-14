import { useCallback } from 'react';
import { statementsService, Statement } from '../api';
import { useApi, useMutation } from './useApi';

/**
 * Hook to fetch all statements
 */
export function useStatements() {
  return useApi(() => statementsService.getStatements());
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
