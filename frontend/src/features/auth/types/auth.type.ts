export interface User {
  id: number;
  email: string;
  full_name: string;
  role: 'student' | 'admin';
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
  student_stats: StudentStats | null;
}

export interface StudentStats {
  id: number;
  user_id: number;
  skill_mastery: Record<string, number>;
  current_profile: string;
  avg_mastery: number;
  last_updated: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignUpData {
  email: string;
  password: string;
  full_name?: string;
  role?: 'student' | 'admin';
}

export interface Token {
  access_token: string;
  token_type: string;
  expires_in: number;
}

export interface AuthResponse {
  // student_stats: StudentStats;
  user: User;
  token: Token;
}

export interface AuthState {
  user: User | null;
  studentStats: StudentStats | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}