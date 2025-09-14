// Common types for the application

export interface RouteConfig {
  path: string;
  element: React.ComponentType;
  title?: string;
}

export interface NavigationItem {
  label: string;
  path: string;
  icon?: string;
}

// Add more types as needed for your application
export interface User {
  id: string;
  name: string;
  email: string;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}
