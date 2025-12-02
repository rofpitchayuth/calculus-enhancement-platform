import type { LoginCredentials, SignUpData, AuthResponse, User } from '../types/auth.type';

const API_BASE_URL = 'http://localhost:8000/api/v1';

class AuthApiService {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Login failed');
      }

      const data = await response.json();
      
      localStorage.setItem('authToken', data.token.access_token);
      
      return data;
    } catch (error) {
      throw error;
    }
  }

  async signUp(data: SignUpData): Promise<AuthResponse> {
    try {
      const backendData = {
        email: data.email,
        password: data.password,
        full_name: (data as any).full_name || "",
        role: (data as any).role
      };

      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(backendData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Registration failed');
      }

      const responseData = await response.json();
      
      localStorage.setItem('authToken', responseData.token.access_token);
      
      return responseData;
    } catch (error) {
      throw error;
    }
  }

  async getCurrentUser(): Promise<User> {
    const token = localStorage.getItem('authToken');
    
    if (!token) {
      throw new Error('No token found');
    }

    try {
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to get user');
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  }

  async logout(): Promise<void> {
    try {
      localStorage.removeItem('authToken');
      localStorage.removeItem('refreshToken');
    } catch (error) {
      console.warn('Logout failed:', error);
    }
  }

  isAuthenticated(): boolean {
    const token = localStorage.getItem('authToken');
    return !!token;
  }
  
  getToken(): string | null {
    return localStorage.getItem('authToken');
  }
}

export const authApi = new AuthApiService();