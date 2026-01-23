import { supabase } from './supabase';
import { checkRateLimit } from '../utils/security';

export interface SecurityLog {
  id?: string;
  user_id?: string;
  event_type:
    | 'login'
    | 'logout'
    | 'failed_login'
    | 'suspicious_activity'
    | 'data_access'
    | 'data_deletion';
  ip_address?: string;
  user_agent?: string;
  metadata?: Record<string, any>;
  created_at: string;
}

export interface DataDeletionRequest {
  id?: string;
  user_id: string;
  request_type: 'account_deletion' | 'data_export' | 'data_deletion';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  requested_at: string;
  completed_at?: string;
  error_message?: string;
}

export class SecurityService {
  /**
   * Log security event
   */
  static async logSecurityEvent(event: SecurityLog): Promise<void> {
    try {
      await supabase.from('security_logs').insert([
        {
          ...event,
          created_at: new Date().toISOString(),
        },
      ]);
    } catch (error) {
      console.error('Error logging security event:', error);
    }
  }

  /**
   * Check for suspicious login patterns
   */
  static async detectSuspiciousActivity(userId: string, ipAddress?: string): Promise<boolean> {
    try {
      // Check for multiple failed login attempts in last hour
      const oneHourAgo = new Date();
      oneHourAgo.setHours(oneHourAgo.getHours() - 1);

      const { data: failedLogins } = await supabase
        .from('security_logs')
        .select('*')
        .eq('user_id', userId)
        .eq('event_type', 'failed_login')
        .gte('created_at', oneHourAgo.toISOString());

      if (failedLogins && failedLogins.length >= 5) {
        return true; // Suspicious: 5+ failed logins in last hour
      }

      // Check for logins from multiple IPs in short time
      if (ipAddress) {
        const { data: recentLogins } = await supabase
          .from('security_logs')
          .select('ip_address')
          .eq('user_id', userId)
          .eq('event_type', 'login')
          .gte('created_at', oneHourAgo.toISOString());

        if (recentLogins) {
          const uniqueIPs = new Set(recentLogins.map((l) => l.ip_address));
          if (uniqueIPs.size >= 3) {
            return true; // Suspicious: logins from 3+ different IPs
          }
        }
      }

      return false;
    } catch (error) {
      console.error('Error detecting suspicious activity:', error);
      return false;
    }
  }

  /**
   * Request user data deletion (GDPR compliance)
   */
  static async requestDataDeletion(
    userId: string,
    requestType: DataDeletionRequest['request_type']
  ): Promise<{ success: boolean; requestId?: string; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('data_deletion_requests')
        .insert([
          {
            user_id: userId,
            request_type: requestType,
            status: 'pending',
            requested_at: new Date().toISOString(),
          },
        ])
        .select()
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      // Log security event
      await this.logSecurityEvent({
        user_id: userId,
        event_type: 'data_deletion',
        metadata: { request_type: requestType },
        created_at: new Date().toISOString(),
      });

      return { success: true, requestId: data.id };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to request data deletion';
      return { success: false, error: message };
    }
  }

  /**
   * Process data deletion request
   */
  static async processDataDeletion(requestId: string): Promise<boolean> {
    try {
      // Get deletion request
      const { data: request } = await supabase
        .from('data_deletion_requests')
        .select('*')
        .eq('id', requestId)
        .single();

      if (!request) return false;

      // Update status to processing
      await supabase
        .from('data_deletion_requests')
        .update({ status: 'processing' })
        .eq('id', requestId);

      const userId = request.user_id;

      // Delete user data based on request type
      if (request.request_type === 'account_deletion') {
        // Delete all user-related data
        await supabase.from('bookmarks').delete().eq('user_id', userId);
        await supabase.from('reading_history').delete().eq('user_id', userId);
        await supabase.from('reading_sessions').delete().eq('user_id', userId);
        await supabase.from('user_preferences').delete().eq('user_id', userId);
        await supabase.from('user_subscriptions').delete().eq('user_id', userId);

        // Delete auth user (requires admin privileges)
        // This should be done by admin/backend service
      } else if (request.request_type === 'data_deletion') {
        // Delete specific user data but keep account
        await supabase.from('reading_history').delete().eq('user_id', userId);
        await supabase.from('reading_sessions').delete().eq('user_id', userId);
      }

      // Update status to completed
      await supabase
        .from('data_deletion_requests')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
        })
        .eq('id', requestId);

      return true;
    } catch (error) {
      console.error('Error processing data deletion:', error);

      // Update status to failed
      await supabase
        .from('data_deletion_requests')
        .update({
          status: 'failed',
          error_message: error instanceof Error ? error.message : 'Unknown error',
        })
        .eq('id', requestId);

      return false;
    }
  }

  /**
   * Export user data (GDPR compliance)
   */
  static async exportUserData(userId: string): Promise<{
    success: boolean;
    data?: any;
    error?: string;
  }> {
    try {
      // Fetch all user data
      const [bookmarks, readingHistory, preferences, subscription] = await Promise.all([
        supabase.from('bookmarks').select('*').eq('user_id', userId),
        supabase.from('reading_history').select('*').eq('user_id', userId),
        supabase.from('user_preferences').select('*').eq('user_id', userId).single(),
        supabase.from('user_subscriptions').select('*').eq('user_id', userId).single(),
      ]);

      const userData = {
        user_id: userId,
        bookmarks: bookmarks.data || [],
        reading_history: readingHistory.data || [],
        preferences: preferences.data || null,
        subscription: subscription.data || null,
        exported_at: new Date().toISOString(),
      };

      // Log data access
      await this.logSecurityEvent({
        user_id: userId,
        event_type: 'data_access',
        metadata: { action: 'export' },
        created_at: new Date().toISOString(),
      });

      return { success: true, data: userData };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to export data';
      return { success: false, error: message };
    }
  }

  /**
   * Sanitize user input to prevent XSS
   */
  static sanitizeInput(input: string): string {
    return input
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  }

  /**
   * Validate API request with rate limiting
   */
  static validateApiRequest(
    userId: string,
    endpoint: string,
    _maxRequests: number = 100,
    _windowMinutes: number = 1
  ): { allowed: boolean; remaining?: number; resetAt?: Date } {
    const rateLimit = checkRateLimit(`${userId}_${endpoint}`, 'api');

    return {
      allowed: rateLimit.allowed,
      remaining: undefined, // Not available from simple rate limit
      resetAt: undefined, // Not available from simple rate limit
    };
  }

  /**
   * Check if user has admin permissions
   */
  static async verifyAdminPermissions(userId: string): Promise<boolean> {
    try {
      const { data: user } = await supabase.auth.getUser();

      if (!user || user.user?.id !== userId) return false;

      // Check user metadata for admin flag
      const metadata = user.user?.user_metadata;
      return metadata?.is_admin === true;
    } catch (error) {
      console.error('Error verifying admin permissions:', error);
      return false;
    }
  }

  /**
   * Generate secure random token
   * Note: For production use, integrate expo-crypto or crypto.getRandomValues()
   */
  static generateSecureToken(length: number = 32): string {
    // Use cryptographically secure random number generation
    // In React Native, use expo-crypto or react-native-get-random-values
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let token = '';

    // For web compatibility, use crypto.getRandomValues if available
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
      const randomValues = new Uint8Array(length);
      crypto.getRandomValues(randomValues);
      for (let i = 0; i < length; i++) {
        token += chars.charAt(randomValues[i] % chars.length);
      }
    } else {
      // Fallback: This should be replaced with expo-crypto in production
      console.warn('Using fallback random generation - not cryptographically secure');
      for (let i = 0; i < length; i++) {
        token += chars.charAt(Math.floor(Math.random() * chars.length));
      }
    }

    return token;
  }

  /**
   * Validate content for abuse/spam
   */
  static validateContent(content: string): {
    isValid: boolean;
    reason?: string;
  } {
    // Check for spam patterns
    const spamPatterns = [/viagra/i, /casino/i, /click here/i, /buy now/i, /limited time/i];

    for (const pattern of spamPatterns) {
      if (pattern.test(content)) {
        return { isValid: false, reason: 'Potential spam content detected' };
      }
    }

    // Check for excessive links
    const linkCount = (content.match(/https?:\/\//g) || []).length;
    if (linkCount > 10) {
      return { isValid: false, reason: 'Too many links in content' };
    }

    // Check for excessive caps
    const capsRatio = (content.match(/[A-Z]/g) || []).length / content.length;
    if (capsRatio > 0.5 && content.length > 20) {
      return { isValid: false, reason: 'Excessive use of capital letters' };
    }

    return { isValid: true };
  }

  /**
   * Get security recommendations for user
   */
  static async getSecurityRecommendations(userId: string): Promise<string[]> {
    const recommendations: string[] = [];

    try {
      // Check for recent suspicious activity
      const isSuspicious = await this.detectSuspiciousActivity(userId);
      if (isSuspicious) {
        recommendations.push('Review recent login activity for unauthorized access');
      }

      // Check for weak password (would need to access auth data)
      // This is a placeholder
      recommendations.push('Consider enabling two-factor authentication');

      // Check for old sessions
      const { data: sessions } = await supabase
        .from('security_logs')
        .select('*')
        .eq('user_id', userId)
        .eq('event_type', 'login')
        .order('created_at', { ascending: false })
        .limit(1);

      if (sessions && sessions.length > 0) {
        const lastLogin = new Date(sessions[0].created_at);
        const daysSinceLogin = (new Date().getTime() - lastLogin.getTime()) / (1000 * 60 * 60 * 24);

        if (daysSinceLogin > 90) {
          recommendations.push('Update your password regularly (every 90 days)');
        }
      }

      return recommendations;
    } catch (error) {
      console.error('Error getting security recommendations:', error);
      return [];
    }
  }
}
