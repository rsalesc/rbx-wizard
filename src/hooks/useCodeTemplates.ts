import { useState, useCallback } from 'react';
import { useApi } from './useApi';
import { codeTemplatesService, CodeTemplateType } from '../api/services/codeTemplates';
import { CodeResponse } from '../api/types';

/**
 * Hook to fetch a specific code template
 */
export function useCodeTemplate(type: CodeTemplateType) {
  return useApi<CodeResponse>(
    () => codeTemplatesService.getCodeTemplate(type),
    [type]
  );
}

/**
 * Hook to manage code templates with dynamic fetching
 */
export function useCodeTemplatesManager() {
  const [selectedType, setSelectedType] = useState<CodeTemplateType>('validator');
  const [codeCache, setCodeCache] = useState<Record<CodeTemplateType, string>>({
    validator: '',
    checker: '',
    interactor: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchCodeTemplate = useCallback(async (type: CodeTemplateType) => {
    // Check if we already have this code in cache
    if (codeCache[type]) {
      return codeCache[type];
    }

    setLoading(true);
    setError(null);

    try {
      const response = await codeTemplatesService.getCodeTemplate(type);
      const code = response.code;
      
      // Update cache
      setCodeCache(prev => ({
        ...prev,
        [type]: code
      }));

      return code;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [codeCache]);

  const selectTemplate = useCallback(async (type: CodeTemplateType) => {
    setSelectedType(type);
    try {
      await fetchCodeTemplate(type);
    } catch (err) {
      // Error is already handled in fetchCodeTemplate
      console.error(`Failed to fetch ${type} template:`, err);
    }
  }, [fetchCodeTemplate]);

  const getSelectedCode = useCallback(() => {
    return codeCache[selectedType] || '';
  }, [codeCache, selectedType]);

  const clearCache = useCallback(() => {
    setCodeCache({
      validator: '',
      checker: '',
      interactor: ''
    });
  }, []);

  return {
    selectedType,
    selectTemplate,
    getSelectedCode,
    loading,
    error,
    clearCache,
    codeCache
  };
}
