import { useState, useEffect, createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import { authApi } from '../service/auth.service';
import type { 
  LoginCredentials, 
  SignUpData, 
  AuthState, 
  User, 
  StudentStats 
} from '../types/auth.type';

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  signUp: (data: SignUpData) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    studentStats: null,
    token: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
  });

  // Re-hydrate session on mount
  useEffect(() => {
    const initializeAuth = async () => {
      const token = authApi.getToken();
      
      if (token) {
        try {
          const currentUser = await authApi.getCurrentUser();
          setState({
            user: currentUser,
            studentStats: currentUser.student_stats || null, 
            token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          // Token might be invalid/expired
          authApi.logout();
          setState(prev => ({
            ...prev,
            user: null,
            studentStats: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
          }));
        }
      } else {
        setState(prev => ({
          ...prev,
          isLoading: false,
        }));
      }
    };

    initializeAuth();
  }, []);

  const login = async (credentials: LoginCredentials) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const response = await authApi.login(credentials);
      setState({
        user: response.user, 
        studentStats: response.user.student_stats || null, 
        token: response.token.access_token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Login failed',
      }));
      throw error;
    }
  };

  const signUp = async (data: SignUpData) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const response = await authApi.signUp(data);
      setState({
        user: response.user,
        studentStats: response.user.student_stats || null,
        token: response.token.access_token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Sign up failed',
      }));
      throw error;
    }
  };

  const logout = () => {
    authApi.logout();
    setState({
      user: null,
      studentStats: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
  };

  const refreshUser = async () => {
    try {
      const currentUser = await authApi.getCurrentUser();
      setState(prev => ({ 
        ...prev, 
        user: currentUser,
        studentStats: currentUser.student_stats || null 
      }));
    } catch (error) {
      logout();
    }
  };

  return (
    <AuthContext.Provider value={{
      ...state,
      login,
      signUp,
      logout,
      refreshUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}