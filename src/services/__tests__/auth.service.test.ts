import { AuthService } from '../auth.service';
import { supabase } from '../supabase';
import { clearRateLimits } from '../../utils/security';

jest.mock('../supabase');

describe('AuthService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    clearRateLimits();
  });

  describe('signUp', () => {
    it('should successfully sign up a new user', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        created_at: '2024-01-01T00:00:00Z',
      };

      const mockData = {
        user: mockUser,
        session: null,
      };

      (supabase.auth.signUp as jest.Mock).mockResolvedValue({
        data: mockData,
        error: null,
      });

      const credentials = {
        email: 'test@example.com',
        password: 'Password123!',
        full_name: 'Test User',
      };

      const result = await AuthService.signUp(credentials);

      expect(result.error).toBeUndefined();
      expect(result.data).toEqual({
        id: 'user-123',
        email: 'test@example.com',
        full_name: 'Test User',
        is_admin: false,
        created_at: '2024-01-01T00:00:00Z',
      });
      expect(supabase.auth.signUp).toHaveBeenCalledWith({
        email: credentials.email.trim(),
        password: credentials.password,
        options: {
          data: {
            full_name: credentials.full_name.trim(),
          },
        },
      });
    });

    it('should return error when sign up fails', async () => {
      (supabase.auth.signUp as jest.Mock).mockResolvedValue({
        data: { user: null, session: null },
        error: { message: 'User already exists' },
      });

      const result = await AuthService.signUp({
        email: 'test@example.com',
        password: 'Password123!',
        full_name: 'Test User',
      });

      expect(result.error).toBe('User already exists');
      expect(result.data).toBeUndefined();
    });

    it('should return error when user object is null', async () => {
      (supabase.auth.signUp as jest.Mock).mockResolvedValue({
        data: { user: null, session: null },
        error: null,
      });

      const result = await AuthService.signUp({
        email: 'test@example.com',
        password: 'Password123!',
        full_name: 'Test User',
      });

      expect(result.error).toBe('Failed to create user');
      expect(result.data).toBeUndefined();
    });

    it('should handle exceptions during sign up', async () => {
      (supabase.auth.signUp as jest.Mock).mockRejectedValue(new Error('Network error'));

      const result = await AuthService.signUp({
        email: 'test@example.com',
        password: 'Password123!',
        full_name: 'Test User',
      });

      expect(result.error).toBe('Network error');
      expect(result.data).toBeUndefined();
    });
  });

  describe('signIn', () => {
    it('should successfully sign in a user', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        created_at: '2024-01-01T00:00:00Z',
        user_metadata: {
          full_name: 'Test User',
          avatar_url: 'https://example.com/avatar.jpg',
          is_admin: false,
        },
      };

      (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValue({
        data: { user: mockUser, session: {} },
        error: null,
      });

      const result = await AuthService.signIn({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(result.error).toBeUndefined();
      expect(result.data).toEqual({
        id: 'user-123',
        email: 'test@example.com',
        full_name: 'Test User',
        avatar_url: 'https://example.com/avatar.jpg',
        is_admin: false,
        created_at: '2024-01-01T00:00:00Z',
      });
    });

    it('should return error when sign in fails', async () => {
      (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValue({
        data: { user: null, session: null },
        error: { message: 'Invalid credentials' },
      });

      const result = await AuthService.signIn({
        email: 'test@example.com',
        password: 'wrongpassword',
      });

      expect(result.error).toBe('Invalid credentials');
      expect(result.data).toBeUndefined();
    });

    it('should handle missing user metadata', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        created_at: '2024-01-01T00:00:00Z',
        user_metadata: {},
      };

      (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValue({
        data: { user: mockUser, session: {} },
        error: null,
      });

      const result = await AuthService.signIn({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(result.data?.is_admin).toBe(false);
      expect(result.data?.full_name).toBeUndefined();
      expect(result.data?.avatar_url).toBeUndefined();
    });
  });

  describe('signOut', () => {
    it('should successfully sign out', async () => {
      (supabase.auth.signOut as jest.Mock).mockResolvedValue({
        error: null,
      });

      const result = await AuthService.signOut();

      expect(result.error).toBeUndefined();
      expect(result.data).toBeNull();
      expect(supabase.auth.signOut).toHaveBeenCalled();
    });

    it('should return error when sign out fails', async () => {
      (supabase.auth.signOut as jest.Mock).mockResolvedValue({
        error: { message: 'Sign out failed' },
      });

      const result = await AuthService.signOut();

      expect(result.error).toBe('Sign out failed');
    });
  });

  describe('getCurrentUser', () => {
    it('should return current user', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        created_at: '2024-01-01T00:00:00Z',
        user_metadata: {
          full_name: 'Test User',
          is_admin: true,
        },
      };

      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const result = await AuthService.getCurrentUser();

      expect(result).toEqual({
        id: 'user-123',
        email: 'test@example.com',
        full_name: 'Test User',
        avatar_url: undefined,
        is_admin: true,
        created_at: '2024-01-01T00:00:00Z',
      });
    });

    it('should return null when no user is logged in', async () => {
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: null },
        error: null,
      });

      const result = await AuthService.getCurrentUser();

      expect(result).toBeNull();
    });

    it('should return null on error', async () => {
      (supabase.auth.getUser as jest.Mock).mockRejectedValue(new Error('Network error'));

      const result = await AuthService.getCurrentUser();

      expect(result).toBeNull();
    });
  });

  describe('getSession', () => {
    it('should return current session', async () => {
      const mockSession = {
        access_token: 'token-123',
        refresh_token: 'refresh-123',
      };

      (supabase.auth.getSession as jest.Mock).mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });

      const result = await AuthService.getSession();

      expect(result).toEqual(mockSession);
    });

    it('should return null when no session exists', async () => {
      (supabase.auth.getSession as jest.Mock).mockResolvedValue({
        data: { session: null },
        error: null,
      });

      const result = await AuthService.getSession();

      expect(result).toBeNull();
    });

    it('should return null on error', async () => {
      (supabase.auth.getSession as jest.Mock).mockRejectedValue(new Error('Error'));

      const result = await AuthService.getSession();

      expect(result).toBeNull();
    });
  });

  describe('isAuthenticated', () => {
    it('should return true when user has valid session', async () => {
      (supabase.auth.getSession as jest.Mock).mockResolvedValue({
        data: { session: { access_token: 'token' } },
        error: null,
      });

      const result = await AuthService.isAuthenticated();

      expect(result).toBe(true);
    });

    it('should return false when no session exists', async () => {
      (supabase.auth.getSession as jest.Mock).mockResolvedValue({
        data: { session: null },
        error: null,
      });

      const result = await AuthService.isAuthenticated();

      expect(result).toBe(false);
    });
  });

  describe('resetPassword', () => {
    it('should successfully send password reset email', async () => {
      (supabase.auth.resetPasswordForEmail as jest.Mock).mockResolvedValue({
        error: null,
      });

      const result = await AuthService.resetPassword('test@example.com');

      expect(result.error).toBeUndefined();
      expect(result.data).toBeNull();
      expect(result.message).toBe('Password reset email sent');
      expect(supabase.auth.resetPasswordForEmail).toHaveBeenCalledWith('test@example.com');
    });

    it('should return error when reset fails', async () => {
      (supabase.auth.resetPasswordForEmail as jest.Mock).mockResolvedValue({
        error: { message: 'Invalid email' },
      });

      const result = await AuthService.resetPassword('invalid@example.com');

      expect(result.error).toBe('Invalid email');
    });
  });

  describe('updateProfile', () => {
    it('should successfully update user profile', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        created_at: '2024-01-01T00:00:00Z',
        user_metadata: {
          full_name: 'Updated Name',
          avatar_url: 'https://example.com/new-avatar.jpg',
          is_admin: false,
        },
      };

      (supabase.auth.updateUser as jest.Mock).mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const updates = {
        full_name: 'Updated Name',
        avatar_url: 'https://example.com/new-avatar.jpg',
      };

      const result = await AuthService.updateProfile(updates);

      expect(result.error).toBeUndefined();
      expect(result.data?.full_name).toBe('Updated Name');
      expect(result.data?.avatar_url).toBe('https://example.com/new-avatar.jpg');
      expect(supabase.auth.updateUser).toHaveBeenCalledWith({
        data: {
          full_name: updates.full_name,
          avatar_url: updates.avatar_url,
        },
      });
    });

    it('should filter out admin-related fields from updates', async () => {
      const mockUser = {
        id: 'test-user-id',
        email: 'test@example.com',
        created_at: '2024-01-01T00:00:00Z',
        user_metadata: {
          full_name: 'Updated Name',
          is_admin: false, // Should remain false even if someone tries to update it
        },
      };

      (supabase.auth.updateUser as jest.Mock).mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      // Try to update profile with is_admin field (malicious attempt)
      const updates: any = {
        full_name: 'Updated Name',
        is_admin: true, // This should be filtered out
      };

      const result = await AuthService.updateProfile(updates);

      expect(result.error).toBeUndefined();
      expect(result.data?.is_admin).toBe(false); // Should still be false
      // Verify that updateUser was called WITHOUT is_admin field
      expect(supabase.auth.updateUser).toHaveBeenCalledWith({
        data: {
          full_name: 'Updated Name',
          avatar_url: undefined,
        },
      });
    });

    it('should return error when update fails', async () => {
      (supabase.auth.updateUser as jest.Mock).mockResolvedValue({
        data: { user: null },
        error: { message: 'Update failed' },
      });

      const result = await AuthService.updateProfile({
        full_name: 'New Name',
      });

      expect(result.error).toBe('Update failed');
    });

    it('should return error when user is null', async () => {
      (supabase.auth.updateUser as jest.Mock).mockResolvedValue({
        data: { user: null },
        error: null,
      });

      const result = await AuthService.updateProfile({
        full_name: 'New Name',
      });

      expect(result.error).toBe('Failed to update profile');
    });
  });
});
