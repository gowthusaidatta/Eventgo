import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { AppRole, Profile } from '@/lib/types';

interface User {
  id: string;
  email?: string;
  full_name?: string;
  role?: AppRole;
  [key: string]: any;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  role: AppRole | null;
  isLoading: boolean;
  signUp: (email: string, password: string, fullName: string, role: AppRole, additionalData?: any) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Determine API URL based on environment
const getApiBaseUrl = () => {
  // Use environment variable if available
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }
  
  // For Docker containers, use relative path to backend service
  if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
    return 'http://localhost:3000';
  }
  
  // For production or other environments
  return 'http://eventgo-backend:3000';
};

const API_BASE_URL = getApiBaseUrl();

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [role, setRole] = useState<AppRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const getToken = () => localStorage.getItem('auth_token');
  const setToken = (token: string) => localStorage.setItem('auth_token', token);
  const removeToken = () => localStorage.removeItem('auth_token');

  const refreshProfile = async () => {
    const token = getToken();
    if (!token || !user) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/users/${user.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const userData = await response.json();
        setProfile(userData.profile || null);
        setRole(userData.role || null);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  useEffect(() => {
    // Check if user is already authenticated on load
    const checkAuth = async () => {
      const token = getToken();
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/auth/user`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          if (data.authenticated && data.user) {
            setUser(data.user);
            setRole(data.user.role || null);
            await refreshProfile();
          } else {
            removeToken();
          }
        } else {
          removeToken();
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        removeToken();
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const signUp = async (email: string, password: string, fullName: string, role: AppRole, additionalData?: any) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          full_name: fullName,
          role,
          ...additionalData,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        return { error };
      }

      const data = await response.json();
      setToken(data.token);
      setUser(data.user);
      setRole(data.user.role || null);

      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const error = await response.json();
        return { error };
      }

      const data = await response.json();
      setToken(data.token);
      setUser(data.user);
      setRole(data.user.role || null);

      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  const signOut = async () => {
    try {
      await fetch(`${API_BASE_URL}/auth/logout`);
    } catch (error) {
      console.error('Logout error:', error);
    }

    removeToken();
    setUser(null);
    setProfile(null);
    setRole(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      role,
      isLoading,
      signUp,
      signIn,
      signOut,
      refreshProfile,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
