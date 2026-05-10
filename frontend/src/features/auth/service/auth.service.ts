import apiClient from '../../../shared/api/apiClient';
import type { 
  LoginCredentials, 
  SignUpData, 
  AuthResponse, 
  User // เปลี่ยนจาก StudentStats เป็น User
} from '../types/auth.type';

class AuthApiService {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<AuthResponse>('/auth/login', credentials);
      
      if (response.data?.token?.access_token) {
        this.setToken(response.data.token.access_token);
      }
      
      return response.data;
    } catch (error: any) {
      this.handleError(error, 'Login failed');
    }
  }

  async signUp(data: SignUpData): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<AuthResponse>('/auth/register', data);
      
      if (response.data?.token?.access_token) {
        this.setToken(response.data.token.access_token);
      }
      
      return response.data;
    } catch (error: any) {
      this.handleError(error, 'Registration failed');
    }
  }

  // แก้ตรงนี้: เปลี่ยน Return Type เป็น User
  async getCurrentUser(): Promise<User> {
    try {
      const response = await apiClient.get<User>('/auth/me');
      return response.data;
    } catch (error: any) {
      this.handleError(error, 'Failed to get current user session');
    }
  }

  async logout(): Promise<void> {
    localStorage.removeItem('access_token');
  }

  private setToken(token: string): void {
    localStorage.setItem('access_token', token);
  }

  getToken(): string | null {
    return localStorage.getItem('access_token');
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  private handleError(error: any, defaultMessage: string): never {
    const detail = error.response?.data?.detail || defaultMessage;
    throw new Error(detail);
  }
}

export const authApi = new AuthApiService();