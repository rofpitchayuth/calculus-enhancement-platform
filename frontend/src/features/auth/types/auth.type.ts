export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignUpData {
  email: string;
  password: string;
  fullName?: string;
  role?: 'student' | 'teacher' | 'admin';
}

export interface User {
  id: number;
  email: string;
  fullName: string;
  role: 'student' | 'teacher' | 'admin';
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
}

export interface Token {
  access_token: string;
  token_type: string;
  expires_in: number;
}

export interface AuthResponse {
  user: User;
  token: Token;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}