import { apiClient } from '../client';

// Types for the LLM review endpoint
export interface ReviewRequest {
  statement: string;
  language: string;
  checker?: string;
  interactor?: string;
  validator: string;
  model: string;
}

// Full review now returns a markdown string
export type FullReviewResponse = string;

// Types for the statement language review endpoint
export interface StatementLanguageReviewRequest {
  statement: string;
  language: string;
  model: string;
}

export type StatementLanguageReviewResponse = string; // Markdown string

// Types for the models endpoint
export interface ModelsResponse {
  models: string[];
}

// LLM service
export const llmService = {
  /**
   * Reviews a problem statement with its checker and validator
   * @param request The review request containing statement, language, checker, and validator
   * @returns A markdown string with the review results
   */
  async reviewStatement(request: ReviewRequest): Promise<FullReviewResponse> {
    return apiClient.post<FullReviewResponse>('/llm/review', request, { noTimeout: true });
  },
  
  /**
   * Reviews a problem statement's language and clarity
   * @param request The review request containing statement and language
   * @returns A markdown string with the review results
   */
  async reviewStatementLanguage(request: StatementLanguageReviewRequest): Promise<StatementLanguageReviewResponse> {
    return apiClient.post<StatementLanguageReviewResponse>('/llm/review/statement', request, { noTimeout: true });
  },
  
  /**
   * Fetches available LLM models
   * @returns An object containing an array of available model names
   */
  async getModels(): Promise<ModelsResponse> {
    return apiClient.get<ModelsResponse>('/llm/models');
  },
};
