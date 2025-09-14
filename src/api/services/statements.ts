import { apiClient } from '../client';
import { API_ENDPOINTS } from '../config';
import { Statement, StatementsResponse } from '../types';

export const statementsService = {
  /**
   * Fetch all available statements
   */
  async getStatements(): Promise<Statement[]> {
    const response = await apiClient.get<StatementsResponse>(API_ENDPOINTS.statements);
    return response.statements;
  },

  /**
   * Fetch a single statement by ID
   */
  async getStatement(id: string): Promise<Statement> {
    return apiClient.get<Statement>(`${API_ENDPOINTS.statement}/${id}`);
  }
};
