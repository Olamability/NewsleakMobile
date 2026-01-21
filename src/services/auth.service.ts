import { supabase } from './supabase';
import { AuthCredentials, SignUpCredentials, User, ApiResponse } from '../types';
import { validateEmail, validatePassword, validateName } from '../utils/validation';
import { checkRateLimit } from '../utils/security';

export class AuthService {
  /**
   * Sign up a new user
   */
  static async signUp(credentials: SignUpCredentials): Promise<ApiResponse<User>> {
    try {
      const emailValidation = validateEmail(credentials.email);
      if (!emailValidation.isValid) {
        return { error: emailValidation.error };
      }

      const passwordValidation = validatePassword(credentials.password);
      if (!passwordValidation.isValid) {
        return { error: passwordValidation.error };
      }

      if (credentials.full_name) {
        const nameValidation = validateName(credentials.full_name);
        if (!nameValidation.isValid) {
          return { error: nameValidation.error };
        }
      }

      const rateLimit = checkRateLimit(credentials.email, 'auth');
      if (!rateLimit.allowed) {
        return {
          error: `Too many attempts. Please try again in ${rateLimit.retryAfter} seconds.`,
        };
      }

      const { data, error } = await supabase.auth.signUp({
        email: credentials.email.trim(),
        password: credentials.password,
        options: {
          data: {
            full_name: credentials.full_name?.trim(),
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
          is_admin: false, // New users are not admins by default
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
      const emailValidation = validateEmail(credentials.email);
      if (!emailValidation.isValid) {
        return { error: emailValidation.error };
      }

      if (!credentials.password || credentials.password.length === 0) {
        return { error: 'Password is required' };
      }

      const rateLimit = checkRateLimit(credentials.email, 'auth');
      if (!rateLimit.allowed) {
        return {
          error: `Too many attempts. Please try again in ${rateLimit.retryAfter} seconds.`,
        };
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email.trim(),
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
          is_admin: data.user.user_metadata?.is_admin || false,
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
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        return null;
      }

      return {
        id: user.id,
        email: user.email!,
        full_name: user.user_metadata?.full_name,
        avatar_url: user.user_metadata?.avatar_url,
        is_admin: user.user_metadata?.is_admin || false,
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
      const {
        data: { session },
      } = await supabase.auth.getSession();
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
      const emailValidation = validateEmail(email);
      if (!emailValidation.isValid) {
        return { error: emailValidation.error };
      }

      const rateLimit = checkRateLimit(email, 'auth');
      if (!rateLimit.allowed) {
        return {
          error: `Too many attempts. Please try again in ${rateLimit.retryAfter} seconds.`,
        };
      }

      const { error } = await supabase.auth.resetPasswordForEmail(email.trim());

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
   * NOTE: is_admin and other sensitive fields are filtered out to prevent privilege escalation
   */
  static async updateProfile(updates: {
    full_name?: string;
    avatar_url?: string;
  }): Promise<ApiResponse<User>> {
    try {
      if (updates.full_name) {
        const nameValidation = validateName(updates.full_name);
        if (!nameValidation.isValid) {
          return { error: nameValidation.error };
        }
        updates.full_name = updates.full_name.trim();
      }

      // Filter out any admin-related or sensitive fields that shouldn't be user-editable
      // This prevents users from escalating their privileges
      const safeUpdates = {
        full_name: updates.full_name,
        avatar_url: updates.avatar_url,
      };

      const { data, error } = await supabase.auth.updateUser({
        data: safeUpdates,
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
          is_admin: data.user.user_metadata?.is_admin || false,
          created_at: data.user.created_at,
        },
      };
    } catch (error: any) {
      return { error: error.message || 'Profile update failed' };
    }
  }
}
