import { apiClient } from '../client';
import { API_ENDPOINTS } from '../config';
import { CodeResponse } from '../types';

export type CodeTemplateType = 'validator' | 'checker' | 'interactor';

export const codeTemplatesService = {
  /**
   * Fetch validator code template
   */
  async getValidator(): Promise<CodeResponse> {
    return apiClient.get<CodeResponse>(API_ENDPOINTS.validator);
  },

  /**
   * Fetch checker code template
   */
  async getChecker(): Promise<CodeResponse> {
    return apiClient.get<CodeResponse>(API_ENDPOINTS.checker);
  },

  /**
   * Fetch interactor code template
   */
  async getInteractor(): Promise<CodeResponse> {
    return apiClient.get<CodeResponse>(API_ENDPOINTS.interactor);
  },

  /**
   * Fetch code template by type
   */
  async getCodeTemplate(type: CodeTemplateType): Promise<CodeResponse> {
    switch (type) {
      case 'validator':
        return this.getValidator();
      case 'checker':
        return this.getChecker();
      case 'interactor':
        return this.getInteractor();
      default:
        throw new Error(`Unknown code template type: ${type}`);
    }
  },

  /**
   * Save validator code
   */
  async saveValidator(code: string): Promise<CodeResponse> {
    return apiClient.put<CodeResponse>(API_ENDPOINTS.validator, {code});
  },

  /**
   * Save checker code
   */
  async saveChecker(code: string): Promise<CodeResponse> {
    return apiClient.put<CodeResponse>(API_ENDPOINTS.checker, {code});
  },

  /**
   * Save interactor code
   */
  async saveInteractor(code: string): Promise<CodeResponse> {
    return apiClient.put<CodeResponse>(API_ENDPOINTS.interactor, {code});
  },

  /**
   * Save code template by type
   */
  async saveCodeTemplate(type: CodeTemplateType, code: string): Promise<CodeResponse> {
    switch (type) {
      case 'validator':
        return this.saveValidator(code);
      case 'checker':
        return this.saveChecker(code);
      case 'interactor':
        return this.saveInteractor(code);
      default:
        throw new Error(`Unknown code template type: ${type}`);
    }
  }
};
