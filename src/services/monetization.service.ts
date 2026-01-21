import { supabase } from './supabase';

export type SubscriptionTier = 'free' | 'premium' | 'pro';

export interface UserSubscription {
  user_id: string;
  tier: SubscriptionTier;
  starts_at: string;
  expires_at?: string;
  is_active: boolean;
  auto_renew: boolean;
  payment_method?: string;
}

export interface AdPlacement {
  id: string;
  type: 'banner' | 'native' | 'interstitial' | 'video';
  position: 'home_feed' | 'article_detail' | 'category_feed' | 'search_results';
  frequency: number; // Show every N items
  is_active: boolean;
}

export interface SponsoredContent {
  id: string;
  article_id: string;
  sponsor_name: string;
  campaign_name: string;
  starts_at: string;
  expires_at: string;
  is_active: boolean;
  click_count: number;
  impression_count: number;
}

export interface FeatureGate {
  feature_name: string;
  required_tier: SubscriptionTier;
  is_enabled: boolean;
  description: string;
}

export class MonetizationService {
  /**
   * Feature gates configuration
   */
  private static featureGates: FeatureGate[] = [
    {
      feature_name: 'unlimited_bookmarks',
      required_tier: 'free',
      is_enabled: true,
      description: 'Save unlimited articles',
    },
    {
      feature_name: 'offline_reading',
      required_tier: 'premium',
      is_enabled: false, // Disabled by default, can be enabled
      description: 'Download articles for offline reading',
    },
    {
      feature_name: 'ad_free_experience',
      required_tier: 'premium',
      is_enabled: false,
      description: 'Browse without advertisements',
    },
    {
      feature_name: 'smart_recommendations',
      required_tier: 'premium',
      is_enabled: true,
      description: 'AI-powered personalized recommendations',
    },
    {
      feature_name: 'priority_support',
      required_tier: 'pro',
      is_enabled: false,
      description: 'Priority customer support',
    },
    {
      feature_name: 'custom_categories',
      required_tier: 'pro',
      is_enabled: false,
      description: 'Create custom news categories',
    },
    {
      feature_name: 'export_articles',
      required_tier: 'pro',
      is_enabled: false,
      description: 'Export articles to PDF/EPUB',
    },
  ];

  /**
   * Ad placements configuration
   */
  private static adPlacements: AdPlacement[] = [
    {
      id: 'home_banner_1',
      type: 'banner',
      position: 'home_feed',
      frequency: 10, // Every 10 articles
      is_active: false, // Disabled by default
    },
    {
      id: 'article_native_1',
      type: 'native',
      position: 'article_detail',
      frequency: 1, // Once per article
      is_active: false,
    },
    {
      id: 'category_banner_1',
      type: 'banner',
      position: 'category_feed',
      frequency: 8,
      is_active: false,
    },
  ];

  /**
   * Get user subscription status
   */
  static async getUserSubscription(userId: string): Promise<UserSubscription | null> {
    try {
      const { data, error } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error || !data) {
        // Default to free tier if no subscription found
        return {
          user_id: userId,
          tier: 'free',
          starts_at: new Date().toISOString(),
          is_active: true,
          auto_renew: false,
        };
      }

      // Check if subscription is expired
      if (data.expires_at && new Date(data.expires_at) < new Date()) {
        return {
          ...data,
          tier: 'free',
          is_active: false,
        };
      }

      return data;
    } catch (error) {
      console.error('Error getting user subscription:', error);
      return {
        user_id: userId,
        tier: 'free',
        starts_at: new Date().toISOString(),
        is_active: true,
        auto_renew: false,
      };
    }
  }

  /**
   * Check if user has access to a feature
   */
  static async hasFeatureAccess(userId: string, featureName: string): Promise<boolean> {
    try {
      const featureGate = this.featureGates.find((f) => f.feature_name === featureName);

      if (!featureGate) {
        // Feature doesn't exist, allow by default
        return true;
      }

      if (!featureGate.is_enabled) {
        // Feature is disabled globally
        return false;
      }

      const subscription = await this.getUserSubscription(userId);
      if (!subscription) return false;

      // Check tier hierarchy
      const tierHierarchy: Record<SubscriptionTier, number> = {
        free: 1,
        premium: 2,
        pro: 3,
      };

      const userTierLevel = tierHierarchy[subscription.tier];
      const requiredTierLevel = tierHierarchy[featureGate.required_tier];

      return userTierLevel >= requiredTierLevel;
    } catch (error) {
      console.error('Error checking feature access:', error);
      return false;
    }
  }

  /**
   * Get all feature gates for a user
   */
  static async getUserFeatureAccess(userId: string): Promise<Record<string, boolean>> {
    const accessMap: Record<string, boolean> = {};

    for (const feature of this.featureGates) {
      accessMap[feature.feature_name] = await this.hasFeatureAccess(userId, feature.feature_name);
    }

    return accessMap;
  }

  /**
   * Determine if ad should be shown to user
   */
  static async shouldShowAd(userId: string, position: AdPlacement['position']): Promise<boolean> {
    try {
      // Check if user has ad-free subscription
      const hasAdFree = await this.hasFeatureAccess(userId, 'ad_free_experience');
      if (hasAdFree) return false;

      // Check if ads are enabled for this position
      const placement = this.adPlacements.find((p) => p.position === position && p.is_active);
      return placement !== undefined;
    } catch (error) {
      console.error('Error checking ad eligibility:', error);
      return false;
    }
  }

  /**
   * Get ad placement configuration
   */
  static getAdPlacement(position: AdPlacement['position']): AdPlacement | null {
    return this.adPlacements.find((p) => p.position === position && p.is_active) || null;
  }

  /**
   * Track sponsored content impression
   */
  static async trackSponsoredImpression(contentId: string): Promise<void> {
    try {
      // Update impression count directly without stored procedure
      const { data: content } = await supabase
        .from('sponsored_content')
        .select('impression_count')
        .eq('id', contentId)
        .single();

      if (content) {
        await supabase
          .from('sponsored_content')
          .update({ impression_count: (content.impression_count || 0) + 1 })
          .eq('id', contentId);
      }
    } catch (error) {
      console.error('Error tracking sponsored impression:', error);
    }
  }

  /**
   * Track sponsored content click
   */
  static async trackSponsoredClick(contentId: string): Promise<void> {
    try {
      // Update click count directly without stored procedure
      const { data: content } = await supabase
        .from('sponsored_content')
        .select('click_count')
        .eq('id', contentId)
        .single();

      if (content) {
        await supabase
          .from('sponsored_content')
          .update({ click_count: (content.click_count || 0) + 1 })
          .eq('id', contentId);
      }
    } catch (error) {
      console.error('Error tracking sponsored click:', error);
    }
  }

  /**
   * Check if article is sponsored content
   */
  static async isSponsoredContent(articleId: string): Promise<SponsoredContent | null> {
    try {
      const { data, error } = await supabase
        .from('sponsored_content')
        .select('*')
        .eq('article_id', articleId)
        .eq('is_active', true)
        .single();

      if (error || !data) return null;

      // Check if campaign is within valid date range
      const now = new Date();
      const startsAt = new Date(data.starts_at);
      const expiresAt = new Date(data.expires_at);

      if (now < startsAt || now > expiresAt) {
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error checking sponsored content:', error);
      return null;
    }
  }

  /**
   * Get subscription pricing tiers
   */
  static getSubscriptionTiers(): Array<{
    tier: SubscriptionTier;
    name: string;
    price: string;
    features: string[];
  }> {
    return [
      {
        tier: 'free',
        name: 'Free',
        price: '$0/month',
        features: [
          'Access to all news sources',
          'Unlimited reading',
          'Basic bookmarks',
          'Ad-supported',
        ],
      },
      {
        tier: 'premium',
        name: 'Premium',
        price: '$4.99/month',
        features: [
          'Everything in Free',
          'Ad-free experience',
          'Offline reading',
          'Smart recommendations',
          'Unlimited bookmarks',
        ],
      },
      {
        tier: 'pro',
        name: 'Pro',
        price: '$9.99/month',
        features: [
          'Everything in Premium',
          'Priority support',
          'Custom categories',
          'Export articles',
          'Advanced analytics',
        ],
      },
    ];
  }

  /**
   * Update user subscription
   */
  static async updateSubscription(
    userId: string,
    tier: SubscriptionTier,
    durationMonths: number = 1
  ): Promise<boolean> {
    try {
      const startsAt = new Date();
      const expiresAt = new Date();
      expiresAt.setMonth(expiresAt.getMonth() + durationMonths);

      const { error } = await supabase.from('user_subscriptions').upsert({
        user_id: userId,
        tier,
        starts_at: startsAt.toISOString(),
        expires_at: expiresAt.toISOString(),
        is_active: true,
        auto_renew: false,
      });

      if (error) {
        console.error('Error updating subscription:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error updating subscription:', error);
      return false;
    }
  }

  /**
   * Cancel user subscription
   */
  static async cancelSubscription(userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_subscriptions')
        .update({ is_active: false, auto_renew: false })
        .eq('user_id', userId);

      if (error) {
        console.error('Error canceling subscription:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error canceling subscription:', error);
      return false;
    }
  }

  /**
   * Get paywall configuration for a feature
   */
  static getPaywallConfig(featureName: string): {
    shouldShowPaywall: boolean;
    message: string;
    requiredTier: SubscriptionTier;
  } {
    const feature = this.featureGates.find((f) => f.feature_name === featureName);

    if (!feature || !feature.is_enabled) {
      return {
        shouldShowPaywall: false,
        message: '',
        requiredTier: 'free',
      };
    }

    return {
      shouldShowPaywall: true,
      message: `Upgrade to ${feature.required_tier} to access ${feature.description}`,
      requiredTier: feature.required_tier,
    };
  }
}
