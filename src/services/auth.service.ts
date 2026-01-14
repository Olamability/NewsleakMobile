import { supabase } from './supabase';
import { AuthCredentials, SignUpCredentials, User, ApiResponse } from '../types';

export class AuthService {
  /**
   * Sign up a new user
   */
  static async signUp(credentials: SignUpCredentials): Promise<ApiResponse<User>> {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: credentials.email,
        password: credentials.password,
        options: {
          data: {
            full_name: credentials.full_name,
          },
        },
      });

      if (error) {
        return { error: error.message };
      }

      if (!data.user) {
        return { error: 'Failed to create user' };
      }

      return {
        data: {
          id: data.user.id,
          email: data.user.email!,
          full_name: credentials.full_name,
          created_at: data.user.created_at,
        },
      };
    } catch (error: any) {
      return { error: error.message || 'Sign up failed' };
    }
  }

  /**
   * Sign in an existing user
   */
  static async signIn(credentials: AuthCredentials): Promise<ApiResponse<User>> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });

      if (error) {
        return { error: error.message };
      }

      if (!data.user) {
        return { error: 'Failed to sign in' };
      }

      return {
        data: {
          id: data.user.id,
          email: data.user.email!,
          full_name: data.user.user_metadata?.full_name,
          avatar_url: data.user.user_metadata?.avatar_url,
          created_at: data.user.created_at,
        },
      };
    } catch (error: any) {
      return { error: error.message || 'Sign in failed' };
    }
  }

  /**
   * Sign out the current user
   */
  static async signOut(): Promise<ApiResponse<null>> {
    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        return { error: error.message };
      }

      return { data: null };
    } catch (error: any) {
      return { error: error.message || 'Sign out failed' };
    }
  }

  /**
   * Get the current user session
   */
  static async getCurrentUser(): Promise<User | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        return null;
      }

      return {
        id: user.id,
        email: user.email!,
        full_name: user.user_metadata?.full_name,
        avatar_url: user.user_metadata?.avatar_url,
        created_at: user.created_at,
      };
    } catch (error) {
      return null;
    }
  }

  /**
   * Get the current auth session
   */
  static async getSession() {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      return session;
    } catch (error) {
      return null;
    }
  }

  /**
   * Check if user is authenticated
   */
  static async isAuthenticated(): Promise<boolean> {
    const session = await this.getSession();
    return !!session;
  }

  /**
   * Reset password
   */
  static async resetPassword(email: string): Promise<ApiResponse<null>> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);

      if (error) {
        return { error: error.message };
      }

      return { data: null, message: 'Password reset email sent' };
    } catch (error: any) {
      return { error: error.message || 'Password reset failed' };
    }
  }

  /**
   * Update user profile
   */
  static async updateProfile(updates: { full_name?: string; avatar_url?: string }): Promise<ApiResponse<User>> {
    try {
      const { data, error } = await supabase.auth.updateUser({
        data: updates,
      });

      if (error) {
        return { error: error.message };
      }

      if (!data.user) {
        return { error: 'Failed to update profile' };
      }

      return {
        data: {
          id: data.user.id,
          email: data.user.email!,
          full_name: data.user.user_metadata?.full_name,
          avatar_url: data.user.user_metadata?.avatar_url,
          created_at: data.user.created_at,
        },
      };
    } catch (error: any) {
      return { error: error.message || 'Profile update failed' };
    }
  }
}
