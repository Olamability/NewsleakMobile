import { supabase } from './supabase';
import { ApiResponse, AdminRole, AdminUser } from '../types';

/**
 * AdminRoleService - Manages admin roles and permissions
 * 
 * SECURITY NOTES:
 * - Admin role assignments are protected by RLS policies
 * - Only service role (backend) can insert/update/delete admin_users records
 * - Client-side can only read their own admin status
 * - The is_admin flag in auth metadata is automatically synced via database trigger
 */
export class AdminRoleService {
  /**
   * Check if the current user is an admin
   */
  static async isCurrentUserAdmin(): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return false;
      }

      // Check from admin_users table
      const { data, error } = await supabase
        .from('admin_users')
        .select('id')
        .eq('id', user.id)
        .single();

      if (error || !data) {
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error checking admin status:', error);
      return false;
    }
  }

  /**
   * Get the current user's admin role
   * Returns null if user is not an admin
   */
  static async getCurrentUserRole(): Promise<AdminRole | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return null;
      }

      const { data, error } = await supabase
        .from('admin_users')
        .select('role')
        .eq('id', user.id)
        .single();

      if (error || !data) {
        return null;
      }

      return data.role as AdminRole;
    } catch (error) {
      console.error('Error getting admin role:', error);
      return null;
    }
  }

  /**
   * Get admin user details from the safe view
   * This uses the admin_users_view which joins with auth.users safely
   */
  static async getAdminUserDetails(userId: string): Promise<ApiResponse<AdminUser>> {
    try {
      const { data, error } = await supabase
        .from('admin_users_view')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        return { error: error.message };
      }

      if (!data) {
        return { error: 'Admin user not found' };
      }

      return { data: data as AdminUser };
    } catch (error: any) {
      return { error: error.message || 'Failed to get admin user details' };
    }
  }

  /**
   * Check if user has a specific role level or higher
   * Role hierarchy: editor < admin < super_admin
   */
  static async hasRoleLevel(requiredRole: AdminRole): Promise<boolean> {
    try {
      const currentRole = await this.getCurrentUserRole();
      
      if (!currentRole) {
        return false;
      }

      const roleHierarchy: { [key in AdminRole]: number } = {
        'editor': 1,
        'admin': 2,
        'super_admin': 3,
      };

      return roleHierarchy[currentRole] >= roleHierarchy[requiredRole];
    } catch (error) {
      console.error('Error checking role level:', error);
      return false;
    }
  }

  /**
   * List all admin users (requires admin access)
   * Uses the safe admin_users_view
   */
  static async listAllAdmins(): Promise<ApiResponse<AdminUser[]>> {
    try {
      // First check if current user is admin
      const isAdmin = await this.isCurrentUserAdmin();
      
      if (!isAdmin) {
        return { error: 'Unauthorized: Admin access required' };
      }

      const { data, error } = await supabase
        .from('admin_users_view')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        return { error: error.message };
      }

      return { data: (data || []) as AdminUser[] };
    } catch (error: any) {
      return { error: error.message || 'Failed to list admin users' };
    }
  }

  /**
   * NOTE: Admin role assignment functions
   * 
   * These operations are BLOCKED by RLS policies on the client side.
   * Admin users can only be created/modified via:
   * 1. Direct SQL in Supabase Dashboard (by system admins)
   * 2. Backend API with service role key (not exposed to client)
   * 3. Supabase Edge Functions with proper authentication
   * 
   * Example SQL to create an admin (run in Supabase SQL Editor):
   * 
   * -- Make user an admin
   * INSERT INTO admin_users (id, role)
   * VALUES ('user-uuid-here', 'admin')
   * ON CONFLICT (id) DO UPDATE SET role = 'admin';
   * 
   * -- The trigger will automatically sync is_admin to auth metadata
   */

  /**
   * Helper function to verify admin metadata is in sync
   * This checks if the is_admin flag in auth metadata matches admin_users table
   */
  static async verifyAdminSync(): Promise<{
    synced: boolean;
    inTable: boolean;
    inMetadata: boolean;
  }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return { synced: false, inTable: false, inMetadata: false };
      }

      // Check admin_users table
      const { data } = await supabase
        .from('admin_users')
        .select('id')
        .eq('id', user.id)
        .single();

      const inTable = !!data;
      const inMetadata = !!user.raw_user_meta_data?.is_admin;

      return {
        synced: inTable === inMetadata,
        inTable,
        inMetadata,
      };
    } catch (error) {
      console.error('Error verifying admin sync:', error);
      return { synced: false, inTable: false, inMetadata: false };
    }
  }
}
