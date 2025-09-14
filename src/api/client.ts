import { API_BASE_URL, DEFAULT_HEADERS } from './config';
import { ApiError, ApiRequestOptions } from './types';

class ApiClient {
  private baseUrl: string;
  private defaultHeaders: HeadersInit;

  constructor(baseUrl: string = API_BASE_URL, defaultHeaders: HeadersInit = DEFAULT_HEADERS) {
    this.baseUrl = baseUrl;
    this.defaultHeaders = defaultHeaders;
  }

  private buildUrl(endpoint: string, params?: Record<string, string | number | boolean>): string {
    const url = new URL(`${this.baseUrl}${endpoint}`);
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, String(value));
      });
    }
    
    return url.toString();
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      let errorData: ApiError;
      
      try {
        errorData = await response.json();
      } catch {
        errorData = {
          message: `HTTP Error ${response.status}: ${response.statusText}`,
        };
      }
      
      throw new Error(errorData.message || 'An error occurred');
    }
    
    return response.json();
  }

  async get<T>(endpoint: string, options?: ApiRequestOptions): Promise<T> {
    const { params, ...fetchOptions } = options || {};
    const url = this.buildUrl(endpoint, params);
    
    const response = await fetch(url, {
      ...fetchOptions,
      method: 'GET',
      headers: {
        ...this.defaultHeaders,
        ...fetchOptions.headers,
      },
    });
    
    return this.handleResponse<T>(response);
  }

  async post<T, D = unknown>(endpoint: string, data?: D, options?: ApiRequestOptions): Promise<T> {
    const { params, ...fetchOptions } = options || {};
    const url = this.buildUrl(endpoint, params);
    
    const response = await fetch(url, {
      ...fetchOptions,
      method: 'POST',
      headers: {
        ...this.defaultHeaders,
        ...fetchOptions.headers,
      },
      body: data ? JSON.stringify(data) : undefined,
    });
    
    return this.handleResponse<T>(response);
  }

  async put<T, D = unknown>(endpoint: string, data?: D, options?: ApiRequestOptions): Promise<T> {
    const { params, ...fetchOptions } = options || {};
    const url = this.buildUrl(endpoint, params);
    
    const response = await fetch(url, {
      ...fetchOptions,
      method: 'PUT',
      headers: {
        ...this.defaultHeaders,
        ...fetchOptions.headers,
      },
      body: data ? JSON.stringify(data) : undefined,
    });
    
    return this.handleResponse<T>(response);
  }

  async delete<T>(endpoint: string, options?: ApiRequestOptions): Promise<T> {
    const { params, ...fetchOptions } = options || {};
    const url = this.buildUrl(endpoint, params);
    
    const response = await fetch(url, {
      ...fetchOptions,
      method: 'DELETE',
      headers: {
        ...this.defaultHeaders,
        ...fetchOptions.headers,
      },
    });
    
    return this.handleResponse<T>(response);
  }
}

// Create a singleton instance
export const apiClient = new ApiClient();

// Export the class for custom instances
export { ApiClient };
