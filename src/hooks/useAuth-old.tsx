import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { AppRole, Profile } from '@/lib/types';

interface User {
  id: string;
  email?: string;
  [key: string]: any;
}

interface Session {
  user: User;
  access_token: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  role: AppRole | null;
  isLoading: boolean;
  signUp: (email: string, password: string, fullName: string, role: AppRole, additionalData?: any) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: any }>;
  updatePassword: (password: string) => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [role, setRole] = useState<AppRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/${userId}`, {
        credentials: 'include',
      });
      
      if (!response.ok) throw new Error('Failed to fetch profile');
      
      const userData = await response.json();
      setProfile(userData.profile || null);
      setRole(userData.role || null);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  };

  useEffect(() => {
    // Check if user is already authenticated
    const checkAuth = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/auth/user`, {
          credentials: 'include',
        });
        
        if (response.ok) {
          const userData = await response.json();
          setUser(userData.user);
          setSession({ user: userData.user, access_token: '' });
          
          if (userData.user?.id) {
            await fetchProfile(userData.user.id);
          }
        }
      } catch (error) {
        console.error('Auth check failed:', error);
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
        credentials: 'include',
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
      setUser(data.user);
      setSession({ user: data.user, access_token: data.access_token || '' });

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
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const error = await response.json();
        return { error };
      }

      const data = await response.json();
      setUser(data.user);
      setSession({ user: data.user, access_token: data.access_token || '' });

      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  const signOut = async () => {
    try {
      await fetch(`${API_BASE_URL}/auth/logout`, {
        credentials: 'include',
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
    
    setUser(null);
    setSession(null);
    setProfile(null);
    setRole(null);
  };

  const resetPassword = async (email: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const error = await response.json();
        return { error };
      }

      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  const updatePassword = async (password: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/update-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ password }),
      });

      if (!response.ok) {
        const error = await response.json();
        return { error };
      }

      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      profile,
      role,
      isLoading,
      signUp,
      signIn,
      signOut,
      refreshProfile,
      resetPassword,
      updatePassword,
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
