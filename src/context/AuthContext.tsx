import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { AuthService } from '../services/auth.service';
import { User, AuthCredentials, SignUpCredentials } from '../types';
import { supabase } from '../services/supabase';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signIn: (credentials: AuthCredentials) => Promise<{ error?: string }>;
  signUp: (credentials: SignUpCredentials) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session on mount
    checkUser();

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email!,
          full_name: session.user.user_metadata?.full_name,
          avatar_url: session.user.user_metadata?.avatar_url,
          is_admin: session.user.user_metadata?.is_admin || false,
          created_at: session.user.created_at,
        });
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const checkUser = async () => {
    try {
      const currentUser = await AuthService.getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      console.error('Error checking user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async (credentials: AuthCredentials) => {
    try {
      const response = await AuthService.signIn(credentials);
      if (response.error) {
        return { error: response.error };
      }
      if (response.data) {
        setUser(response.data);
      }
      return {};
    } catch (error: any) {
      return { error: error.message || 'Sign in failed' };
    }
  };

  const signUp = async (credentials: SignUpCredentials) => {
    try {
      const response = await AuthService.signUp(credentials);
      if (response.error) {
        return { error: response.error };
      }
      if (response.data) {
        setUser(response.data);
      }
      return {};
    } catch (error: any) {
      return { error: error.message || 'Sign up failed' };
    }
  };

  const signOut = async () => {
    try {
      await AuthService.signOut();
      setUser(null);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const refreshUser = async () => {
    try {
      const currentUser = await AuthService.getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      console.error('Error refreshing user:', error);
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    signIn,
    signUp,
    signOut,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
