// API-specific types

export interface Statement {
  name: string;
}

export interface StatementsResponse {
  statements: Statement[];
}

export interface ApiError {
  message: string;
  code?: string;
  details?: unknown;
}

export interface ApiRequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean>;
}

export interface CodeResponse {
  path: string;
  code: string;
  language?: string;
}

export interface StatementBuildResponse {
  path: string;
}
