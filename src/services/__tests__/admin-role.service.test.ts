import { AdminRoleService, AdminRole } from '../admin-role.service';
import { supabase } from '../supabase';

// Mock the supabase client
jest.mock('../supabase', () => ({
  supabase: {
    auth: {
      getUser: jest.fn(),
    },
    from: jest.fn(),
  },
}));

describe('AdminRoleService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('isCurrentUserAdmin', () => {
    it('should return true when user is in admin_users table', async () => {
      const mockUser = {
        id: 'admin-user-id',
        email: 'admin@example.com',
      };

      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: mockUser },
      });

      const mockFrom = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { id: 'admin-user-id' },
          error: null,
        }),
      };

      (supabase.from as jest.Mock).mockReturnValue(mockFrom);

      const result = await AdminRoleService.isCurrentUserAdmin();

      expect(result).toBe(true);
      expect(supabase.from).toHaveBeenCalledWith('admin_users');
      expect(mockFrom.eq).toHaveBeenCalledWith('id', 'admin-user-id');
    });

    it('should return false when user is not in admin_users table', async () => {
      const mockUser = {
        id: 'regular-user-id',
        email: 'user@example.com',
      };

      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: mockUser },
      });

      const mockFrom = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: null,
          error: { message: 'No rows found' },
        }),
      };

      (supabase.from as jest.Mock).mockReturnValue(mockFrom);

      const result = await AdminRoleService.isCurrentUserAdmin();

      expect(result).toBe(false);
    });

    it('should return false when user is not logged in', async () => {
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: null },
      });

      const result = await AdminRoleService.isCurrentUserAdmin();

      expect(result).toBe(false);
    });
  });

  describe('getCurrentUserRole', () => {
    it('should return user role when user is admin', async () => {
      const mockUser = {
        id: 'admin-user-id',
        email: 'admin@example.com',
      };

      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: mockUser },
      });

      const mockFrom = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { role: 'admin' },
          error: null,
        }),
      };

      (supabase.from as jest.Mock).mockReturnValue(mockFrom);

      const result = await AdminRoleService.getCurrentUserRole();

      expect(result).toBe('admin');
    });

    it('should return null when user is not admin', async () => {
      const mockUser = {
        id: 'regular-user-id',
        email: 'user@example.com',
      };

      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: mockUser },
      });

      const mockFrom = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: null,
          error: { message: 'No rows found' },
        }),
      };

      (supabase.from as jest.Mock).mockReturnValue(mockFrom);

      const result = await AdminRoleService.getCurrentUserRole();

      expect(result).toBe(null);
    });
  });

  describe('hasRoleLevel', () => {
    it('should return true when user has required role', async () => {
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: { id: 'user-id' } },
      });

      const mockFrom = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { role: 'admin' },
          error: null,
        }),
      };

      (supabase.from as jest.Mock).mockReturnValue(mockFrom);

      const result = await AdminRoleService.hasRoleLevel('editor');

      expect(result).toBe(true);
    });

    it('should return true when user has higher role than required', async () => {
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: { id: 'user-id' } },
      });

      const mockFrom = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { role: 'super_admin' },
          error: null,
        }),
      };

      (supabase.from as jest.Mock).mockReturnValue(mockFrom);

      const result = await AdminRoleService.hasRoleLevel('admin');

      expect(result).toBe(true);
    });

    it('should return false when user has lower role than required', async () => {
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: { id: 'user-id' } },
      });

      const mockFrom = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { role: 'editor' },
          error: null,
        }),
      };

      (supabase.from as jest.Mock).mockReturnValue(mockFrom);

      const result = await AdminRoleService.hasRoleLevel('admin');

      expect(result).toBe(false);
    });
  });

  describe('listAllAdmins', () => {
    it('should return list of admins when user is admin', async () => {
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: { id: 'admin-id' } },
      });

      const mockAdmins = [
        { id: 'admin-1', role: 'admin', email: 'admin1@example.com', created_at: '2024-01-01' },
        { id: 'admin-2', role: 'editor', email: 'admin2@example.com', created_at: '2024-01-02' },
      ];

      // First call checks if user is admin
      const mockFromCheckAdmin = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { id: 'admin-id' },
          error: null,
        }),
      };

      // Second call gets all admins
      const mockFromGetAdmins = {
        select: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({
          data: mockAdmins,
          error: null,
        }),
      };

      (supabase.from as jest.Mock)
        .mockReturnValueOnce(mockFromCheckAdmin)
        .mockReturnValueOnce(mockFromGetAdmins);

      const result = await AdminRoleService.listAllAdmins();

      expect(result.error).toBeUndefined();
      expect(result.data).toHaveLength(2);
      expect(result.data?.[0].role).toBe('admin');
    });

    it('should return error when user is not admin', async () => {
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: { id: 'user-id' } },
      });

      const mockFrom = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: null,
          error: { message: 'Not found' },
        }),
      };

      (supabase.from as jest.Mock).mockReturnValue(mockFrom);

      const result = await AdminRoleService.listAllAdmins();

      expect(result.error).toBe('Unauthorized: Admin access required');
      expect(result.data).toBeUndefined();
    });
  });

  describe('verifyAdminSync', () => {
    it('should return synced true when admin status matches', async () => {
      const mockUser = {
        id: 'admin-id',
        email: 'admin@example.com',
        raw_user_meta_data: {
          is_admin: true,
        },
      };

      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: mockUser },
      });

      const mockFrom = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { id: 'admin-id' },
          error: null,
        }),
      };

      (supabase.from as jest.Mock).mockReturnValue(mockFrom);

      const result = await AdminRoleService.verifyAdminSync();

      expect(result.synced).toBe(true);
      expect(result.inTable).toBe(true);
      expect(result.inMetadata).toBe(true);
    });

    it('should return synced false when admin status does not match', async () => {
      const mockUser = {
        id: 'user-id',
        email: 'user@example.com',
        raw_user_meta_data: {
          is_admin: true, // User has admin flag in metadata but not in table
        },
      };

      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: mockUser },
      });

      const mockFrom = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: null, // Not in admin_users table
          error: { message: 'Not found' },
        }),
      };

      (supabase.from as jest.Mock).mockReturnValue(mockFrom);

      const result = await AdminRoleService.verifyAdminSync();

      expect(result.synced).toBe(false);
      expect(result.inTable).toBe(false);
      expect(result.inMetadata).toBe(true);
    });
  });
});
